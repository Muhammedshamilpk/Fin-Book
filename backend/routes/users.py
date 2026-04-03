from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from core.database import get_db, get_supabase_admin
from core.security import require_role
from models.user import User, UserRole
from schemas.user import UserResponse, UserUpdateRole, UserAdminCreate

router = APIRouter()

@router.post("/", response_model=UserResponse)
def create_user(
    user_data: UserAdminCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.admin]))
):
    """Admin creates a user directly in Supabase and local DB"""
    supabase = get_supabase_admin()
    
    # 1. Create in Supabase Auth
    try:
        auth_response = supabase.auth.admin.create_user({
            "email": user_data.email,
            "password": user_data.password,
            "email_confirm": True
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    if not auth_response.user:
        raise HTTPException(status_code=400, detail="Failed to create user in Auth provider.")

    # 2. Save in local database
    new_user = User(
        id=auth_response.user.id,
        name=user_data.name,
        email=user_data.email,
        role=user_data.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get("/", response_model=List[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.admin]))
):
    """List all users in the system (Admin only)"""
    return db.query(User).all()

@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.admin]))
):
    """Get details of a specific user (Admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.patch("/{user_id}/role", response_model=UserResponse)
def update_user_role(
    user_id: UUID,
    role_update: UserUpdateRole,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.admin]))
):
    """Change a user's role (Admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Don't let last admin demote themselves (optional safety)
    if user.id == current_user.id and role_update.role != UserRole.admin:
         # Check if there are other admins
         admins_count = db.query(User).filter(User.role == UserRole.admin).count()
         if admins_count <= 1:
             raise HTTPException(status_code=400, detail="Cannot demote the only administrator.")

    user.role = role_update.role
    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}")
def delete_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.admin]))
):
    """Remove a user from the localized database profile (Admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cant delete yourself!")

    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}
