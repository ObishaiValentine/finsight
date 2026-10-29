"""Transaction service — handle CRUD operations."""

from typing import Dict, List, Optional
from datetime import datetime, timezone, timedelta
from collections import defaultdict
from fastapi import HTTPException, status

from app.core.supabase_client import supabase
from app.services.parsers.hybrid_parser import HybridParser
from app.services.category_service import category_service

# Nigeria is UTC+1
WAT_TIMEZONE = timezone(timedelta(hours=1))

class TransactionService:
    """Handle transaction storage and retrieval."""

    def __init__(self):
        self.parser = HybridParser()

    def create_transaction(self, user_id: str, data: Dict) -> Dict:
        """Insert a new transaction, handling duplicates gracefully."""
        try:
            payload = {**data, "user_id": user_id}

            if isinstance(payload.get("transaction_date"), datetime):
                payload["transaction_date"] = payload["transaction_date"].isoformat()

            # If it has a gmail_id, use UPSERT to ignore duplicates
            if payload.get("raw_text") and payload["raw_text"].startswith("gmail_id:"):
                response = (
                    supabase.table("transactions")
                    .upsert(payload, on_conflict="user_id,raw_text")
                    .execute()
                )
            else:
                # Normal insert for manual entries
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

    def deduplicate_transactions(self, user_id: str) -> int:
        """Self-healing function: deletes exact duplicates."""
        try:
            response = (
                supabase.table("transactions")
                .select("id, raw_text, created_at")
                .eq("user_id", user_id)
                .order("created_at", desc=False)
                .execute()
            )
            transactions = response.data or []
            
            seen_raw_texts = set()
            duplicate_ids = []

            for tx in transactions:
                raw_text = tx.get("raw_text")
                if not raw_text:
                    continue
                if raw_text in seen_raw_texts:
                    duplicate_ids.append(tx["id"])
                else:
                    seen_raw_texts.add(raw_text)

            if duplicate_ids:
                chunk_size = 50
                for i in range(0, len(duplicate_ids), chunk_size):
                    chunk = duplicate_ids[i:i + chunk_size]
                    supabase.table("transactions").delete().in_("id", chunk).execute()
                
                print(f"Self-healing: Deleted {len(duplicate_ids)} duplicate transactions.")
                return len(duplicate_ids)
            
            return 0

        except Exception as e:
            print(f"Error during deduplication: {str(e)}")
            return 0

    def reparse_existing_transactions(self, user_id: str) -> int:
        """Force re-parse ALL existing transactions, including dates."""
        try:
            all_transactions = []
            limit = 1000
            offset = 0
            
            while True:
                response = (
                    supabase.table("transactions")
                    .select("id, raw_text, merchant, created_at") # Added created_at
                    .eq("user_id", user_id)
                    .range(offset, offset + limit - 1)
                    .execute()
                )
                data = response.data or []
                if not data:
                    break
                all_transactions.extend(data)
                offset += limit

            updated_count = 0

            for tx in all_transactions:
                raw_text = tx.get("raw_text")
                
                if not raw_text or raw_text.startswith("gmail_id:"):
                    continue

                parsed = self.parser.parse_to_dict(raw_text)
                new_merchant = parsed.get("merchant")
                new_date = parsed.get("date")
                
                update_data = {}

                # 1. Update merchant
                if new_merchant and new_merchant != "Unknown Merchant" and new_merchant != tx.get("merchant"):
                    update_data["merchant"] = new_merchant
                    update_data["confidence"] = parsed.get("confidence", tx.get("confidence"))

                # 2. Update Date (Fixes the 1am bug)
                if new_date:
                    if "00:00:00" in str(new_date):
                        created_at = tx.get("created_at")
                        if created_at:
                            try:
                                db_time = datetime.fromisoformat(created_at.replace("Z", "+00:00")).astimezone(WAT_TIMEZONE)
                                parsed_dt = datetime.fromisoformat(new_date)
                                new_date = parsed_dt.replace(
                                    hour=db_time.hour, 
                                    minute=db_time.minute, 
                                    second=db_time.second,
                                    tzinfo=WAT_TIMEZONE
                                ).isoformat()
                            except Exception:
                                pass
                    update_data["transaction_date"] = new_date

                if update_data:
                    supabase.table("transactions").update(update_data).eq("id", tx["id"]).execute()
                    updated_count += 1

            return updated_count

        except Exception as e:
            print(f"Error during re-parse: {str(e)}")
            return 0
        
    def get_stats(self, user_id: str) -> Dict:
        """Get statistics, with timezone-accurate 'Today' calculations."""
        try:
            response = (
                supabase.table("transactions")
                .select("*")
                .eq("user_id", user_id)
                .execute()
            )
            transactions = response.data or []

            total_income = 0
            total_expenses = 0
            today_income = 0
            today_expenses = 0
            
            now = datetime.now(WAT_TIMEZONE)
            today_date = now.date()

            for t in transactions:
                amount = t["amount"]
                tx_type = t["transaction_type"]

                if tx_type == "credit":
                    total_income += amount
                elif tx_type == "debit":
                    total_expenses += amount

                date_str = t.get("transaction_date")
                if date_str:
                    try:
                        tx_date_str = date_str.replace("Z", "+00:00")
                        tx_date = datetime.fromisoformat(tx_date_str).astimezone(WAT_TIMEZONE).date()
                        
                        if tx_date == today_date:
                            if tx_type == "credit":
                                today_income += amount
                            elif tx_type == "debit":
                                today_expenses += amount
                    except Exception:
                        continue

            return {
                "total_transactions": len(transactions),
                "total_income": round(total_income, 2),
                "total_expenses": round(total_expenses, 2),
                "net_balance": round(total_income - total_expenses, 2),
                "today_income": round(today_income, 2),
                "today_expenses": round(today_expenses, 2),
                "today_net": round(today_income - today_expenses, 2),
            }

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}",
            )

    def get_analytics(self, user_id: str) -> Dict:
        try:
            response = (
                supabase.table("transactions")
                .select("*")
                .eq("user_id", user_id)
                .order("transaction_date", desc=False)
                .execute()
            )
            transactions = response.data or []

            monthly_data = defaultdict(lambda: {"income": 0, "expenses": 0})
            for tx in transactions:
                try:
                    date_str = tx.get("transaction_date").replace("Z", "+00:00")
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

            category_totals = defaultdict(float)
            for tx in transactions:
                cat = tx.get("category") or "Uncategorized"
                category_totals[cat] += tx["amount"]

            category_colors = {
                "Transfer": "#3b82f6", "Income": "#10b981", "Bills": "#f59e0b",
                "Shopping": "#ec4899", "Entertainment": "#8b5cf6", "Transport": "#06b6d4",
                "Food": "#ef4444", "Refund": "#14b8a6", "Other": "#6b7280", "Uncategorized": "#94a3b8",
            }

            category_breakdown = [
                {"name": cat, "value": round(value, 2), "color": category_colors.get(cat, "#6b7280")}
                for cat, value in sorted(category_totals.items(), key=lambda x: x[1], reverse=True)
            ][:6]

            merchant_totals = defaultdict(lambda: {"amount": 0, "count": 0})
            for tx in transactions:
                if tx["transaction_type"] != "debit":
                    continue
                merchant = tx.get("merchant") or "Unknown"
                merchant_totals[merchant]["amount"] += tx["amount"]
                merchant_totals[merchant]["count"] += 1

            top_merchants_raw = sorted(merchant_totals.items(), key=lambda x: x[1]["amount"], reverse=True)[:5]
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

            return {"monthly_trend": monthly_trend, "category_breakdown": category_breakdown, "top_merchants": top_merchants}

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Analytics error: {str(e)}",
            )

transaction_service = TransactionService()