"""Account service — handle bank account operations."""

from typing import Dict, Optional
from fastapi import HTTPException, status

from app.core.supabase_client import supabase


class AccountService:
    """Handle bank account CRUD."""

    def create_account(self, user_id: str, data: Dict) -> Dict:
        """Create a new bank account."""
        try:
            payload = {**data, "user_id": user_id, "is_active": True}
            response = supabase.table("accounts").insert(payload).execute()

            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create account",
                )

            return response.data[0]

        except HTTPException:
            raise
        except Exception as e:
            error_msg = str(e).lower()
            if "duplicate" in error_msg or "unique" in error_msg:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Account already exists for this user",
                )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}",
            )

    def get_accounts(self, user_id: str) -> Dict:
        """Get all active accounts for a user."""
        try:
            response = (
                supabase.table("accounts")
                .select("*")
                .eq("user_id", user_id)
                .eq("is_active", True)
                .order("created_at", desc=True)
                .execute()
            )

            accounts = response.data or []
            total_balance = sum(acc.get("balance", 0) for acc in accounts)

            return {
                "accounts": accounts,
                "total": len(accounts),
                "total_balance": round(total_balance, 2),
            }

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}",
            )

    def get_archived_accounts(self, user_id: str) -> Dict:
        """Get all inactive (archived) accounts for a user."""
        try:
            response = (
                supabase.table("accounts")
                .select("*")
                .eq("user_id", user_id)
                .eq("is_active", False)
                .order("updated_at", desc=True)
                .execute()
            )

            accounts = response.data or []
            total_balance = sum(acc.get("balance", 0) for acc in accounts)

            return {
                "accounts": accounts,
                "total": len(accounts),
                "total_balance": round(total_balance, 2),
            }

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}",
            )

    def get_account(self, user_id: str, account_id: str) -> Optional[Dict]:
        """Get a single account by ID."""
        try:
            response = (
                supabase.table("accounts")
                .select("*")
                .eq("id", account_id)
                .eq("user_id", user_id)
                .single()
                .execute()
            )
            return response.data
        except Exception:
            return None

    def update_account(self, user_id: str, account_id: str, data: Dict) -> Dict:
        """Update an account."""
        try:
            response = (
                supabase.table("accounts")
                .update(data)
                .eq("id", account_id)
                .eq("user_id", user_id)
                .execute()
            )

            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Account not found",
                )

            return response.data[0]

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}",
            )

    def delete_account(self, user_id: str, account_id: str) -> bool:
        """Soft-delete an account (mark as inactive)."""
        try:
            response = (
                supabase.table("accounts")
                .update({"is_active": False})
                .eq("id", account_id)
                .eq("user_id", user_id)
                .execute()
            )
            return bool(response.data)
        except Exception:
            return False

    def restore_account(self, user_id: str, account_id: str) -> Dict:
        """Restore a soft-deleted account."""
        try:
            response = (
                supabase.table("accounts")
                .update({"is_active": True})
                .eq("id", account_id)
                .eq("user_id", user_id)
                .eq("is_active", False)
                .execute()
            )

            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Archived account not found",
                )

            return response.data[0]

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}",
            )


# Singleton
account_service = AccountService()