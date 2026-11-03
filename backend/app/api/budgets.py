"""Budget API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from app.services.budget_service import budget_service
from app.api.deps import get_current_user

router = APIRouter(prefix="/budgets", tags=["Budgets"])

class BudgetCreate(BaseModel):
    category: str = Field(..., min_length=2)
    monthly_limit: float = Field(..., gt=0)

@router.get("")
def get_budgets(current_user: dict = Depends(get_current_user)):
    """Get all budgets with current month usage."""
    return budget_service.get_budgets(current_user["id"])

@router.post("")
def set_budget(
    payload: BudgetCreate,
    current_user: dict = Depends(get_current_user),
):
    """Create or update a budget."""
    return budget_service.set_budget(
        user_id=current_user["id"],
        category=payload.category,
        monthly_limit=payload.monthly_limit,
    )

@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(
    budget_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Delete a budget."""
    success = budget_service.delete_budget(current_user["id"], budget_id)
    if not success:
        raise HTTPException(status_code=404, detail="Budget not found")
    return None