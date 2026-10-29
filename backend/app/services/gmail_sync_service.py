"""Gmail sync service — fetch alerts, parse, and save to transactions."""

import datetime
import email.utils
from typing import Dict
from fastapi import HTTPException

from app.core.supabase_client import supabase
from app.services.gmail_service import gmail_service
from app.services.parsers.hybrid_parser import HybridParser
from app.services.category_service import category_service


# Map sender email domains to bank names
BANK_SENDER_MAP = {
    'ubagroup.com': 'UBA',
    'gtbank.com': 'GTB',
    'zenithbank.com': 'Zenith',
    'accessbank.com': 'Access',
    'accessbankplc.com': 'Access',
    'firstbanknigeria.com': 'First Bank',
    'fidelitybank.ng': 'Fidelity',
    'stanbicibtc.com': 'Stanbic IBTC',
    'sterling.ng': 'Sterling',
    'wemabank.com': 'Wema',
    'getcarbon.co': 'Carbon',
    'opay.com': 'OPay',
    'kuda.com': 'Kuda',
    'moniepoint.com': 'Moniepoint',
    'palmpay.com': 'PalmPay',
}


class GmailSyncService:
    """Orchestrate Gmail fetch → parse → save pipeline."""

    def __init__(self):
        self.parser = HybridParser()

    def _detect_bank(self, sender: str, body: str = '') -> str:
        sender_lower = sender.lower()
        for domain, bank in BANK_SENDER_MAP.items():
            if domain in sender_lower:
                return bank

        body_lower = body.lower()[:500]
        if 'carbon' in body_lower: return 'Carbon'
        if 'gtb' in body_lower or 'gtbank' in body_lower: return 'GTB'
        if 'zenith' in body_lower: return 'Zenith'
        if 'access bank' in body_lower: return 'Access'
        if 'uba' in body_lower or 'united bank for africa' in body_lower: return 'UBA'
        if 'first bank' in body_lower: return 'First Bank'
        if 'kuda' in body_lower: return 'Kuda'
        if 'opay' in body_lower: return 'OPay'
        if 'palmpay' in body_lower: return 'PalmPay'
        if 'moniepoint' in body_lower: return 'Moniepoint'

        return 'Unknown'

    def _is_duplicate(self, user_id: str, gmail_id: str) -> bool:
        try:
            response = (
                supabase.table("transactions")
                .select("id")
                .eq("user_id", user_id)
                .eq("raw_text", f"gmail_id:{gmail_id}")
                .limit(1)
                .execute()
            )
            if response.data:
                return True

            deleted = (
                supabase.table("deleted_gmail_ids")
                .select("id")
                .eq("user_id", user_id)
                .eq("gmail_id", gmail_id)
                .limit(1)
                .execute()
            )
            return bool(deleted.data)
        except Exception:
            return False

    def sync_user_emails(self, user_id: str, max_results: int = 50) -> Dict:
        alerts = gmail_service.fetch_bank_alerts(
            user_id=user_id,
            max_results=max_results,
        )

        synced = 0
        skipped = 0
        failed = 0
        errors = []
        synced_transactions = []

        WAT = datetime.timezone(datetime.timedelta(hours=1))

        for alert in alerts:
            gmail_id = alert.get('gmail_id', '')
            sender = alert.get('sender', '')
            body = alert.get('body', '')

            body_lower = body.lower()
            if "recent transactions" in body_lower:
                body = body[:body_lower.index("recent transactions")].strip()

            if self._is_duplicate(user_id, gmail_id):
                skipped += 1
                continue

            if not body.strip():
                failed += 1
                continue

            bank = self._detect_bank(sender, body)

            try:
                parsed = self.parser.parse_to_dict(body)
            except Exception as e:
                failed += 1
                errors.append(f"Parse error: {str(e)[:100]}")
                continue

            if not parsed.get('amount') or not parsed.get('transaction_type') or not parsed.get('date'):
                skipped += 1
                continue

            category = category_service.categorize(
                text=f"{parsed.get('merchant') or ''} {body}",
                transaction_type=parsed.get('transaction_type'),
            )

            # --- BULLETPROOF TIMEZONE FALLBACK LOGIC ---
            parsed_date_str = parsed["date"]
            received_at = alert.get('received_at', '')
            final_date_obj = None

            try:
                parsed_dt = datetime.datetime.fromisoformat(parsed_date_str)
                # If parser found a time (not midnight)
                if parsed_dt.hour != 0 or parsed_dt.minute != 0:
                    if parsed_dt.tzinfo is None:
                        parsed_dt = parsed_dt.replace(tzinfo=WAT)
                    final_date_obj = parsed_dt
            except Exception:
                pass

            # If parser failed or found midnight, use the Gmail received timestamp
            if not final_date_obj and received_at:
                try:
                    clean_received = received_at.replace(" at ", " ")
                    email_dt = email.utils.parsedate_to_datetime(clean_received)
                    email_dt_wat = email_dt.astimezone(WAT)
                    
                    if parsed_date_str:
                        try:
                            base_date = datetime.datetime.fromisoformat(parsed_date_str).date()
                            final_date_obj = datetime.datetime.combine(base_date, email_dt_wat.time(), tzinfo=WAT)
                        except:
                            final_date_obj = email_dt_wat
                    else:
                        final_date_obj = email_dt_wat
                except Exception:
                    pass

            if not final_date_obj:
                final_date_obj = datetime.datetime.now(WAT)

            transaction_data = {
                "user_id": user_id,
                "amount": parsed["amount"],
                "transaction_type": parsed["transaction_type"],
                "merchant": parsed.get("merchant"),
                "account_number": parsed.get("account_number"),
                "balance_after": parsed.get("balance"),
                "transaction_date": final_date_obj.isoformat(),
                "confidence": parsed.get("confidence", 0.0),
                "category": category,
                "bank_name": bank,
                "raw_text": f"gmail_id:{gmail_id}\n\n{body}",
            }

            try:
                response = supabase.table("transactions").insert(transaction_data).execute()
                synced += 1
                if response.data:
                    synced_transactions.append(response.data[0])
            except Exception as e:
                failed += 1
                errors.append(f"Save error: {str(e)[:100]}")

        # --- SELF-HEALING: Clean up any duplicates just in case ---
        from app.services.transaction_service import transaction_service
        try:
            cleaned = transaction_service.deduplicate_transactions(user_id)
            if cleaned > 0:
                print(f"Cleaned {cleaned} duplicates during sync.")
        except Exception as e:
            print(f"Deduplication failed: {str(e)}")

        return {
            "total_fetched": len(alerts),
            "synced": synced,
            "skipped_duplicates": skipped,
            "failed": failed,
            "errors": errors[:10],
            "synced_transactions": synced_transactions,
        }

gmail_sync_service = GmailSyncService()