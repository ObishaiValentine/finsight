"""Transaction service — handle CRUD operations."""

from typing import Dict, List, Optional
from datetime import datetime
from collections import defaultdict
from fastapi import HTTPException, status

from app.core.supabase_client import supabase
from app.services.parsers.hybrid_parser import HybridParser
from app.services.category_service import category_service


class TransactionService:
    """Handle transaction storage and retrieval."""

    def __init__(self):
        self.parser = HybridParser()

    def create_transaction(self, user_id: str, data: Dict) -> Dict:
        """Insert a new transaction into database."""
        try:
            payload = {**data, "user_id": user_id}

            if isinstance(payload.get("transaction_date"), datetime):
                payload["transaction_date"] = payload["transaction_date"].isoformat()

            response = supabase.table("transactions").insert(payload).execute()

            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create transaction",
                )

            return response.data[0]

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}",
            )

    def parse_and_save(self, user_id: str, raw_text: str) -> Dict:
        """Parse an alert and save the result as transaction."""
        parsed = self.parser.parse_to_dict(raw_text)

        if not parsed.get("amount") or not parsed.get("transaction_type"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not extract required fields from alert",
            )

        # Auto-categorize
        category = category_service.categorize(
            text=f"{parsed.get('merchant') or ''} {raw_text}",
            transaction_type=parsed.get("transaction_type"),
        )

        transaction_data = {
            "amount": parsed["amount"],
            "transaction_type": parsed["transaction_type"],
            "merchant": parsed.get("merchant"),
            "account_number": parsed.get("account_number"),
            "balance_after": parsed.get("balance"),
            "transaction_date": parsed["date"],
            "confidence": parsed.get("confidence", 0.0),
            "category": category,
            "raw_text": raw_text,
        }

        return self.create_transaction(user_id, transaction_data)

    def get_transactions(
        self,
        user_id: str,
        page: int = 1,
        page_size: int = 20,
        transaction_type: Optional[str] = None,
        bank_name: Optional[str] = None,
    ) -> Dict:
        """Get paginated transactions for a user."""
        try:
            query = supabase.table("transactions").select("*", count="exact").eq("user_id", user_id)

            if transaction_type:
                query = query.eq("transaction_type", transaction_type)
            if bank_name:
                query = query.eq("bank_name", bank_name)

            offset = (page - 1) * page_size
            query = query.order("transaction_date", desc=True).range(offset, offset + page_size - 1)

            response = query.execute()

            total = response.count or 0
            total_pages = (total + page_size - 1) // page_size

            return {
                "transactions": response.data or [],
                "total": total,
                "page": page,
                "page_size": page_size,
                "total_pages": total_pages,
            }

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}",
            )

    def get_transaction(self, user_id: str, transaction_id: str) -> Optional[Dict]:
        """Get a single transaction by ID."""
        try:
            response = (
                supabase.table("transactions")
                .select("*")
                .eq("id", transaction_id)
                .eq("user_id", user_id)
                .single()
                .execute()
            )
            return response.data
        except Exception:
            return None

    def delete_transaction(self, user_id: str, transaction_id: str) -> bool:
        """Delete a transaction."""
        try:
            response = (
                supabase.table("transactions")
                .delete()
                .eq("id", transaction_id)
                .eq("user_id", user_id)
                .execute()
            )
            return bool(response.data)
        except Exception:
            return False

    def get_stats(self, user_id: str) -> Dict:
        """Get transaction statistics for dashboard."""
        try:
            response = (
                supabase.table("transactions")
                .select("*")
                .eq("user_id", user_id)
                .execute()
            )
            transactions = response.data or []

            total_income = sum(
                t["amount"] for t in transactions if t["transaction_type"] == "credit"
            )
            total_expenses = sum(
                t["amount"] for t in transactions if t["transaction_type"] == "debit"
            )

            return {
                "total_transactions": len(transactions),
                "total_income": round(total_income, 2),
                "total_expenses": round(total_expenses, 2),
                "net_balance": round(total_income - total_expenses, 2),
            }

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}",
            )

    def get_analytics(self, user_id: str) -> Dict:
        """Get aggregated analytics for dashboard charts."""
        try:
            response = (
                supabase.table("transactions")
                .select("*")
                .eq("user_id", user_id)
                .order("transaction_date", desc=False)
                .execute()
            )
            transactions = response.data or []

            # ===== Monthly trend (last 6 months) =====
            monthly_data = defaultdict(lambda: {"income": 0, "expenses": 0})

            for tx in transactions:
                try:
                    date_str = tx.get("transaction_date")
                    if not date_str:
                        continue
                    date_str = date_str.replace("Z", "+00:00")
                    tx_date = datetime.fromisoformat(date_str)
                    month_key = tx_date.strftime("%b")
                    month_order = tx_date.strftime("%Y-%m")

                    if tx["transaction_type"] == "credit":
                        monthly_data[month_order]["income"] += tx["amount"]
                    else:
                        monthly_data[month_order]["expenses"] += tx["amount"]
                    monthly_data[month_order]["month_label"] = month_key
                except Exception:
                    continue

            sorted_months = sorted(monthly_data.keys())[-6:]
            monthly_trend = [
                {
                    "month": monthly_data[m].get("month_label", m),
                    "income": round(monthly_data[m]["income"], 2),
                    "expenses": round(monthly_data[m]["expenses"], 2),
                }
                for m in sorted_months
            ]

            # ===== Category breakdown =====
            category_totals = defaultdict(float)
            for tx in transactions:
                cat = tx.get("category") or "Uncategorized"
                category_totals[cat] += tx["amount"]

            category_colors = {
                "Transfer": "#3b82f6",
                "Income": "#10b981",
                "Bills": "#f59e0b",
                "Shopping": "#ec4899",
                "Entertainment": "#8b5cf6",
                "Transport": "#06b6d4",
                "Food": "#ef4444",
                "Refund": "#14b8a6",
                "Other": "#6b7280",
                "Uncategorized": "#94a3b8",
            }

            category_breakdown = [
                {
                    "name": cat,
                    "value": round(value, 2),
                    "color": category_colors.get(cat, "#6b7280"),
                }
                for cat, value in sorted(
                    category_totals.items(), key=lambda x: x[1], reverse=True
                )
            ][:6]

            # ===== Top merchants =====
            merchant_totals = defaultdict(lambda: {"amount": 0, "count": 0})
            for tx in transactions:
                if tx["transaction_type"] != "debit":
                    continue
                merchant = tx.get("merchant") or "Unknown"
                merchant_totals[merchant]["amount"] += tx["amount"]
                merchant_totals[merchant]["count"] += 1

            top_merchants_raw = sorted(
                merchant_totals.items(), key=lambda x: x[1]["amount"], reverse=True
            )[:5]

            max_amount = top_merchants_raw[0][1]["amount"] if top_merchants_raw else 1
            top_merchants = [
                {
                    "name": name,
                    "amount": round(data["amount"], 2),
                    "count": data["count"],
                    "percentage": round((data["amount"] / max_amount) * 100, 1),
                }
                for name, data in top_merchants_raw
            ]

            return {
                "monthly_trend": monthly_trend,
                "category_breakdown": category_breakdown,
                "top_merchants": top_merchants,
            }

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Analytics error: {str(e)}",
            )


# Singleton
transaction_service = TransactionService()