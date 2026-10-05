"""Account API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status

from app.schemas.account import (
    AccountCreate,
    AccountUpdate,
    AccountResponse,
    AccountListResponse,
)
from app.services.account_service import account_service
from app.api.deps import get_current_user

router = APIRouter(prefix="/accounts", tags=["Accounts"])


@router.post("", response_model=AccountResponse, status_code=status.HTTP_201_CREATED)
def create_account(
    payload: AccountCreate,
    current_user: dict = Depends(get_current_user),
):
    """Create a new bank account."""
    result = account_service.create_account(
        user_id=current_user["id"],
        data=payload.model_dump(exclude_none=True),
    )
    return result


@router.get("", response_model=AccountListResponse)
def list_accounts(current_user: dict = Depends(get_current_user)):
    """Get all active accounts for current user."""
    return account_service.get_accounts(current_user["id"])


@router.get("/archived", response_model=AccountListResponse)
def list_archived_accounts(current_user: dict = Depends(get_current_user)):
    """Get all archived (soft-deleted) accounts for current user."""
    return account_service.get_archived_accounts(current_user["id"])


@router.get("/{account_id}", response_model=AccountResponse)
def get_account(
    account_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Get a single account."""
    account = account_service.get_account(
        user_id=current_user["id"],
        account_id=account_id,
    )
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found",
        )
    return account


@router.patch("/{account_id}", response_model=AccountResponse)
def update_account(
    account_id: str,
    payload: AccountUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update an account."""
    update_data = payload.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update",
        )
    return account_service.update_account(
        user_id=current_user["id"],
        account_id=account_id,
        data=update_data,
    )


@router.post("/{account_id}/restore", response_model=AccountResponse)
def restore_account(
    account_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Restore a soft-deleted account."""
    return account_service.restore_account(
        user_id=current_user["id"],
        account_id=account_id,
    )


@router.delete("/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(
    account_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Delete an account (soft delete)."""
    success = account_service.delete_account(
        user_id=current_user["id"],
        account_id=account_id,
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found",
        )
    return None