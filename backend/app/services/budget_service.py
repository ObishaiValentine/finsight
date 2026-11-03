"""Budget service — handle budget CRUD and usage calculations."""

from typing import Dict, List
from datetime import datetime, timezone, timedelta
from fastapi import HTTPException, status

from app.core.supabase_client import supabase

# Nigeria is UTC+1
WAT_TIMEZONE = timezone(timedelta(hours=1))

class BudgetService:
    """Handle user budgets and calculate spending against them."""

    def get_budgets(self, user_id: str) -> List[Dict]:
        """Get all budgets for a user with current month usage."""
        try:
            # 1. Get the user's defined budgets
            budgets_response = (
                supabase.table("budgets")
                .select("*")
                .eq("user_id", user_id)
                .execute()
            )
            budgets = budgets_response.data or []

            if not budgets:
                return []

            # 2. Determine the start and end of the current month
            now = datetime.now(WAT_TIMEZONE)
            start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            
            # Calculate end of month
            if now.month == 12:
                end_of_month = start_of_month.replace(year=now.year + 1, month=1)
            else:
                end_of_month = start_of_month.replace(month=now.month + 1)

            # 3. Fetch all debit transactions for this month
            tx_response = (
                supabase.table("transactions")
                .select("amount, category")
                .eq("user_id", user_id)
                .eq("transaction_type", "debit")
                .gte("transaction_date", start_of_month.isoformat())
                .lt("transaction_date", end_of_month.isoformat())
                .execute()
            )
            transactions = tx_response.data or []

            # 4. Sum up spending per category
            spending_by_category = {}
            for tx in transactions:
                cat = tx.get("category") or "Uncategorized"
                spending_by_category[cat] = spending_by_category.get(cat, 0) + float(tx["amount"])

            # 5. Merge budgets with actual spending
            result = []
            for b in budgets:
                category = b["category"]
                limit = float(b["monthly_limit"])
                spent = spending_by_category.get(category, 0)
                remaining = limit - spent
                percent_used = (spent / limit * 100) if limit > 0 else 0

                result.append({
                    "id": b["id"],
                    "category": category,
                    "monthly_limit": limit,
                    "spent_this_month": round(spent, 2),
                    "remaining": round(remaining, 2),
                    "percent_used": round(percent_used, 1),
                })

            return result

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch budgets: {str(e)}",
            )

    def set_budget(self, user_id: str, category: str, monthly_limit: float) -> Dict:
        """Create or update a budget for a specific category."""
        try:
            payload = {
                "user_id": user_id,
                "category": category,
                "monthly_limit": monthly_limit,
            }
            # Upsert to handle both create and update
            response = (
                supabase.table("budgets")
                .upsert(payload, on_conflict="user_id,category")
                .execute()
            )
            return response.data[0] if response.data else {}
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to set budget: {str(e)}",
            )

    def delete_budget(self, user_id: str, budget_id: str) -> bool:
        """Delete a budget."""
        try:
            response = (
                supabase.table("budgets")
                .delete()
                .eq("id", budget_id)
                .eq("user_id", user_id)
                .execute()
            )
            return bool(response.data)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete budget: {str(e)}",
            )

# Singleton
budget_service = BudgetService()