"""Authentication API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.schemas.user import (
    UserSignupRequest,
    UserLoginRequest,
    UserResponse,
    AuthResponse,
    ProfileUpdateRequest,
    PreferencesUpdateRequest,
    NotificationsUpdateRequest,
    PasswordChangeRequest,
)
from app.services.auth_service import auth_service
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: UserSignupRequest):
    """Create a new user account."""
    result = auth_service.signup(
        email=payload.email,
        password=payload.password,
        full_name=payload.full_name,
    )
    return AuthResponse(**result)


@router.post("/login", response_model=AuthResponse)
def login(payload: UserLoginRequest):
    """Login with email and password."""
    result = auth_service.login(
        email=payload.email,
        password=payload.password,
    )
    return AuthResponse(**result)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    """Get current authenticated user."""
    return current_user


@router.patch("/profile", response_model=UserResponse)
def update_profile(
    payload: ProfileUpdateRequest,
    current_user: dict = Depends(get_current_user),
):
    """Update user profile (name, phone, avatar)."""
    return auth_service.update_profile(
        user_id=current_user["id"],
        data=payload.model_dump(exclude_none=True),
    )


@router.patch("/preferences", response_model=UserResponse)
def update_preferences(
    payload: PreferencesUpdateRequest,
    current_user: dict = Depends(get_current_user),
):
    """Update user preferences (currency, language)."""
    return auth_service.update_profile(
        user_id=current_user["id"],
        data=payload.model_dump(exclude_none=True),
    )


@router.patch("/notifications", response_model=UserResponse)
def update_notifications(
    payload: NotificationsUpdateRequest,
    current_user: dict = Depends(get_current_user),
):
    """Update user notification preferences."""
    return auth_service.update_profile(
        user_id=current_user["id"],
        data=payload.model_dump(exclude_none=True),
    )


@router.post("/avatar", response_model=UserResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    """Upload profile avatar."""
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image",
        )

    # Max 5MB
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large. Max 5MB.",
        )

    auth_service.upload_avatar(
        user_id=current_user["id"],
        file_content=content,
        filename=file.filename,
        content_type=file.content_type,
    )

    return auth_service._get_profile(current_user["id"])


@router.post("/change-password")
def change_password(
    payload: PasswordChangeRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """Change user password."""
    auth_service.change_password(
        token=credentials.credentials,
        current_password=payload.current_password,
        new_password=payload.new_password,
    )
    return {"message": "Password updated successfully"}


@router.delete("/account", status_code=status.HTTP_200_OK)
def delete_account(current_user: dict = Depends(get_current_user)):
    """Delete user account (placeholder — implement soft delete)."""
    return {
        "message": "Account deletion requested",
        "note": "Please contact support to complete account deletion",
    }


@router.post("/logout")
def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Logout current user."""
    auth_service.logout(credentials.credentials)
    return {"message": "Logged out successfully"}