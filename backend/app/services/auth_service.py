"""Authentication service — wraps Supabase Auth."""

from typing import Optional, Dict
from fastapi import HTTPException, status

from app.core.supabase_client import get_supabase_anon_client, supabase


class AuthService:
    """Handle signup, login, logout, profile updates via Supabase Auth."""

    def signup(self, email: str, password: str, full_name: str) -> Dict:
        """Create new user via Supabase Auth."""
        try:
            response = supabase.auth.sign_up({
                "email": email,
                "password": password,
                "options": {
                    "data": {
                        "full_name": full_name,
                    }
                }
            })

            if not response.user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Signup failed. Please try again.",
                )

            return {
                "access_token": response.session.access_token if response.session else "",
                "token_type": "bearer",
                "user": {
                    "id": response.user.id,
                    "email": response.user.email,
                    "full_name": full_name,
                    "plan": "free",
                    "avatar_url": None,
                    "currency": "NGN",
                    "language": "en",
                    "notification_email": True,
                    "notification_push": False,
                    "notification_transactions": True,
                    "notification_marketing": False,
                },
            }

        except Exception as e:
            error_msg = str(e)
            if "already registered" in error_msg.lower():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered. Please login.",
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Signup failed: {error_msg}",
            )

    def login(self, email: str, password: str) -> Dict:
        """Login user via Supabase Auth."""
        try:
            response = supabase.auth.sign_in_with_password({
                "email": email,
                "password": password,
            })

            if not response.user or not response.session:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid credentials",
                )

            profile = self._get_profile(response.user.id)

            return {
                "access_token": response.session.access_token,
                "token_type": "bearer",
                "user": profile,
            }

        except HTTPException:
            raise
        except Exception as e:
            error_msg = str(e).lower()
            if "invalid" in error_msg or "credentials" in error_msg:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password",
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Login failed: {str(e)}",
            )

    def _get_profile(self, user_id: str) -> Dict:
        """Fetch user profile from users table."""
        try:
            response = (
                supabase.table("users")
                .select("*")
                .eq("id", user_id)
                .single()
                .execute()
            )
            profile = response.data or {}
        except Exception:
            profile = {}

        return {
            "id": profile.get("id", user_id),
            "email": profile.get("email", ""),
            "full_name": profile.get("full_name", "User"),
            "phone": profile.get("phone"),
            "plan": profile.get("plan", "free"),
            "avatar_url": profile.get("avatar_url"),
            "currency": profile.get("currency", "NGN"),
            "language": profile.get("language", "en"),
            "notification_email": profile.get("notification_email", True),
            "notification_push": profile.get("notification_push", False),
            "notification_transactions": profile.get("notification_transactions", True),
            "notification_marketing": profile.get("notification_marketing", False),
            "created_at": profile.get("created_at"),
        }

    def get_user_from_token(self, token: str) -> Optional[Dict]:
        """Verify JWT and return user data."""
        try:
            response = supabase.auth.get_user(token)
            if not response.user:
                return None

            return self._get_profile(response.user.id)

        except Exception:
            return None

    def update_profile(self, user_id: str, data: Dict) -> Dict:
        """Update user profile fields."""
        try:
            # Only include non-None fields
            update_data = {k: v for k, v in data.items() if v is not None}
            
            if not update_data:
                return self._get_profile(user_id)

            response = (
                supabase.table("users")
                .update(update_data)
                .eq("id", user_id)
                .execute()
            )

            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update profile",
                )

            return self._get_profile(user_id)

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}",
            )

    def upload_avatar(self, user_id: str, file_content: bytes, filename: str, content_type: str) -> str:
        """Upload avatar to Supabase Storage and return public URL."""
        try:
            import uuid
            from datetime import datetime

            # Generate unique filename: user_id/timestamp.ext
            ext = filename.split(".")[-1].lower()
            if ext not in ["jpg", "jpeg", "png", "gif", "webp"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid file type. Use JPG, PNG, GIF, or WebP.",
                )

            storage_path = f"{user_id}/{int(datetime.now().timestamp())}.{ext}"

            # Upload to Supabase storage
            supabase.storage.from_("avatars").upload(
                path=storage_path,
                file=file_content,
                file_options={"content-type": content_type, "upsert": "true"},
            )

            # Get public URL
            public_url = supabase.storage.from_("avatars").get_public_url(storage_path)

            # Save to user profile
            self.update_profile(user_id, {"avatar_url": public_url})

            return public_url

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Upload failed: {str(e)}",
            )

    def change_password(self, token: str, current_password: str, new_password: str) -> bool:
        """Change user password via Supabase Auth."""
        try:
            # Get user from token
            response = supabase.auth.get_user(token)
            if not response.user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token",
                )

            email = response.user.email

            # Verify current password by attempting sign-in
            try:
                supabase.auth.sign_in_with_password({
                    "email": email,
                    "password": current_password,
                })
            except Exception:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Current password is incorrect",
                )

            # Update password
            supabase.auth.update_user({"password": new_password})

            return True

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Password change failed: {str(e)}",
            )

    def logout(self, token: str) -> bool:
        """Sign out user."""
        try:
            supabase.auth.sign_out()
            return True
        except Exception:
            return False


# Singleton
auth_service = AuthService()