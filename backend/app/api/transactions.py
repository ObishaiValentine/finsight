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

from pydantic import BaseModel
from typing import Optional

class TransactionUpdate(BaseModel):
    category: Optional[str] = None


@router.patch("/{transaction_id}")
def update_transaction(
    transaction_id: str,
    payload: TransactionUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update transaction fields (currently category only)."""
    from app.core.supabase_client import supabase

    update_data = {}
    if payload.category is not None:
        update_data["category"] = payload.category

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    # Ensure the transaction belongs to the current user
    response = (
        supabase.table("transactions")
        .update(update_data)
        .eq("id", transaction_id)
        .eq("user_id", current_user["id"])
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="Transaction not found")

    return response.data[0]

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


@router.delete("/{transaction_id}")
def delete_transaction(
    transaction_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Delete a transaction. If e come from Gmail, remember the gmail_id so e no come back."""
    from app.core.supabase_client import supabase

    # Fetch the transaction first — we need its raw_text to know if e come from Gmail
    existing = (
        supabase.table("transactions")
        .select("id, user_id, raw_text")
        .eq("id", transaction_id)
        .eq("user_id", current_user["id"])
        .single()
        .execute()
    )

    if not existing.data:
        raise HTTPException(status_code=404, detail="Transaction not found")

    raw_text = existing.data.get("raw_text") or ""

    # If e come from Gmail, save the gmail_id to deleted_gmail_ids so sync no re-add am
    if raw_text.startswith("gmail_id:"):
        gmail_id = raw_text.replace("gmail_id:", "").strip()
        if gmail_id:
            try:
                supabase.table("deleted_gmail_ids").upsert(
                    {
                        "user_id": current_user["id"],
                        "gmail_id": gmail_id,
                    },
                    on_conflict="user_id,gmail_id",
                ).execute()
            except Exception:
                # If e fail, just continue — no need to block the delete
                pass

    # Now delete the transaction
    supabase.table("transactions").delete().eq("id", transaction_id).eq(
        "user_id", current_user["id"]
    ).execute()

    return {"message": "Transaction deleted"}