"""Transaction API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional

from app.schemas.transaction import (
    TransactionCreate,
    TransactionResponse,
    TransactionListResponse,
    ParseAndSaveRequest,
)
from app.services.transaction_service import transaction_service
from app.api.deps import get_current_user

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.post("", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(
    payload: TransactionCreate,
    current_user: dict = Depends(get_current_user),
):
    """Create a new transaction manually."""
    result = transaction_service.create_transaction(
        user_id=current_user["id"],
        data=payload.model_dump(),
    )
    return result


@router.post("/parse-and-save", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def parse_and_save(
    payload: ParseAndSaveRequest,
    current_user: dict = Depends(get_current_user),
):
    """Parse a bank alert and save it as a transaction."""
    result = transaction_service.parse_and_save(
        user_id=current_user["id"],
        raw_text=payload.text,
    )
    return result


@router.get("", response_model=TransactionListResponse)
def list_transactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    transaction_type: Optional[str] = Query(None, pattern="^(debit|credit)$"),
    bank_name: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
):
    """Get paginated transactions for current user."""
    return transaction_service.get_transactions(
        user_id=current_user["id"],
        page=page,
        page_size=page_size,
        transaction_type=transaction_type,
        bank_name=bank_name,
    )


@router.get("/stats")
def get_stats(current_user: dict = Depends(get_current_user)):
    """Get transaction statistics."""
    return transaction_service.get_stats(current_user["id"])

@router.get("/analytics")
def get_analytics(current_user: dict = Depends(get_current_user)):
    """Get analytics data for charts."""
    return transaction_service.get_analytics(current_user["id"])


@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(
    transaction_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Get a single transaction."""
    transaction = transaction_service.get_transaction(
        user_id=current_user["id"],
        transaction_id=transaction_id,
    )
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )
    return transaction


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Delete a transaction."""
    success = transaction_service.delete_transaction(
        user_id=current_user["id"],
        transaction_id=transaction_id,
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )
    return None