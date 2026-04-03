from pydantic import BaseModel, EmailStr
from uuid import UUID
from typing import Optional
from models.user import UserRole

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserAdminCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole

class UserResponse(BaseModel):
    id: UUID
    name: str
    email: str
    role: UserRole
    is_active: bool

    class Config:
        from_attributes = True

class UserUpdateRole(BaseModel):
    role: UserRole
