from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from core.database import get_db, get_supabase
from core.security import security, HTTPAuthorizationCredentials, get_current_user
from models.user import User, UserRole
from schemas.user import UserResponse

router = APIRouter()

class ProfileUpdate(BaseModel):
    name: str

class PasswordUpdate(BaseModel):
    current_password: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    access_token: str
    user: UserResponse

@router.post("/signup", response_model=AuthResponse)
def signup(creds: UserCreate, db: Session = Depends(get_db)):
    supabase = get_supabase()
    
    # 1. Register with Supabase Auth
    try:
        auth_response = supabase.auth.sign_up({
            "email": creds.email,
            "password": creds.password
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    if not auth_response.user:
        raise HTTPException(status_code=400, detail="Signup failed in Auth provider.")

    # 2. Create User record in local database
    # Handle both new signup and those whose auth account exists but DB does not.
    db_user = db.query(User).filter(User.id == auth_response.user.id).first()
    if not db_user:
        db_user = User(
            id=auth_response.user.id,
            name=creds.name,
            email=creds.email,
            role=UserRole.viewer,
            is_active=True
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

    if not auth_response.session:
        # If email confirmation is enabled, we might not have a session yet.
        raise HTTPException(
            status_code=202, 
            detail="Registration successful! Please check your email and confirm your account before logging in."
        )

    return {
        "access_token": auth_response.session.access_token,
        "user": db_user
    }

@router.post("/login", response_model=AuthResponse)
def login(creds: LoginRequest, db: Session = Depends(get_db)):
    supabase = get_supabase()
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": creds.email,
            "password": creds.password
        })
    except Exception as e:
        # Surface exact error for debugging
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
        
    if not auth_response.session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Failed to retrieve session")

    # SYNC STEP: If user exists in Auth but record is missing in DB (manual creation case)
    db_user = db.query(User).filter(User.id == auth_response.user.id).first()
    if not db_user:
        # Create the record automatically using Auth data
        db_user = User(
            id=auth_response.user.id,
            name=auth_response.user.email.split('@')[0], # Fallback name
            email=auth_response.user.email,
            role=UserRole.viewer,
            is_active=True
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

    return {
        "access_token": auth_response.session.access_token,
        "user": db_user
    }

@router.patch("/profile", response_model=UserResponse)
def update_profile(
    profile_data: ProfileUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update current user's profile information"""
    current_user.name = profile_data.name
    db.commit()
    db.refresh(current_user)
    return current_user

@router.patch("/password")
def update_password(
    password_data: PasswordUpdate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Update current user's password in Supabase Auth with re-authentication"""
    token = credentials.credentials
    supabase = get_supabase()
    
    # 1. Get live user from token to be absolutely sure of the email
    try:
        user_resp = supabase.auth.get_user(token)
        if not user_resp or not user_resp.user:
            raise HTTPException(status_code=401, detail="Session expired")
        live_email = user_resp.user.email
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Session invalid: {str(e)}")

    # 2. Re-verify current password
    try:
        auth_resp = supabase.auth.sign_in_with_password({
            "email": live_email,
            "password": password_data.current_password
        })
        if not auth_resp.session:
            raise HTTPException(status_code=401, detail="Incorrect current password")
    except Exception as e:
        error_msg = str(e).split(':')[-1].strip()
        raise HTTPException(status_code=401, detail=f"Verification failed: {error_msg}")

    # 3. Update with new password
    try:
        resp = supabase.auth.update_user({"password": password_data.password})
        if not resp.user:
            raise HTTPException(status_code=400, detail="Password update failed.")
    except Exception as e:
        error_msg = str(e).split(':')[-1].strip()
        raise HTTPException(status_code=400, detail=f"Rotation failed: {error_msg}")
        
    return {"message": "Credentials successfully rotated"}
