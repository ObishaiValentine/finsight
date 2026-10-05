"""Account Pydantic schemas."""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class AccountCreate(BaseModel):
    """Create a new bank account."""
    bank_name: str = Field(..., min_length=2, max_length=100)
    account_number: str = Field(..., min_length=10, max_length=10)
    account_type: str = Field('savings', pattern="^(savings|current|domiciliary)$")
    balance: float = Field(0.0, ge=0)
    currency: str = Field('NGN', min_length=3, max_length=3)
    notes: Optional[str] = None


class AccountUpdate(BaseModel):
    """Update an existing account."""
    bank_name: Optional[str] = Field(None, min_length=2, max_length=100)
    account_type: Optional[str] = Field(None, pattern="^(savings|current|domiciliary)$")
    balance: Optional[float] = Field(None, ge=0)
    currency: Optional[str] = Field(None, min_length=3, max_length=3)
    notes: Optional[str] = None


class AccountResponse(BaseModel):
    """Account data returned to client."""
    id: str
    user_id: str
    bank_name: str
    account_number: str
    account_type: str
    balance: float
    currency: str
    is_active: bool
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class AccountListResponse(BaseModel):
    """List of accounts."""
    accounts: List[AccountResponse]
    total: int
    total_balance: float