"""User Pydantic schemas for API validation."""

from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional


class UserSignupRequest(BaseModel):
    """Signup request payload."""
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    full_name: str = Field(..., min_length=2, max_length=100)


class UserLoginRequest(BaseModel):
    """Login request payload."""
    email: EmailStr
    password: str = Field(..., min_length=6)


class ProfileUpdateRequest(BaseModel):
    """Profile update payload."""
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = None
    avatar_url: Optional[str] = None


class PreferencesUpdateRequest(BaseModel):
    """Preferences update payload."""
    currency: Optional[str] = Field(None, min_length=3, max_length=3)
    language: Optional[str] = None


class NotificationsUpdateRequest(BaseModel):
    """Notifications update payload."""
    notification_email: Optional[bool] = None
    notification_push: Optional[bool] = None
    notification_transactions: Optional[bool] = None
    notification_marketing: Optional[bool] = None


class PasswordChangeRequest(BaseModel):
    """Password change payload."""
    current_password: str = Field(..., min_length=6)
    new_password: str = Field(..., min_length=6, max_length=100)


class UserResponse(BaseModel):
    """User data returned to client."""
    id: str
    email: str
    full_name: str
    phone: Optional[str] = None
    plan: str = "free"
    avatar_url: Optional[str] = None
    currency: Optional[str] = "NGN"
    language: Optional[str] = "en"
    notification_email: Optional[bool] = True
    notification_push: Optional[bool] = False
    notification_transactions: Optional[bool] = True
    notification_marketing: Optional[bool] = False
    created_at: Optional[datetime] = None


class AuthResponse(BaseModel):
    """Auth response with token and user."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse