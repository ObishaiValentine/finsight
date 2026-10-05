"""Transaction Pydantic schemas."""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from uuid import UUID


class TransactionCreate(BaseModel):
    """Create a new transaction from parsed data."""
    amount: float = Field(..., gt=0)
    transaction_type: str = Field(..., pattern="^(debit|credit)$")
    merchant: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    account_number: Optional[str] = None
    balance_after: Optional[float] = None
    transaction_date: datetime
    bank_name: Optional[str] = None
    confidence: float = Field(0.0, ge=0.0, le=1.0)
    raw_text: Optional[str] = None


class TransactionResponse(BaseModel):
    """Transaction data returned to client."""
    id: str
    user_id: str
    amount: float
    transaction_type: str
    merchant: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    account_number: Optional[str] = None
    balance_after: Optional[float] = None
    transaction_date: datetime
    bank_name: Optional[str] = None
    confidence: float
    created_at: Optional[datetime] = None


class TransactionListResponse(BaseModel):
    """Paginated transaction list."""
    transactions: List[TransactionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class ParseAndSaveRequest(BaseModel):
    """Parse an alert and save as transaction."""
    text: str = Field(..., min_length=10)