"""Gmail sync service — fetch alerts, parse, and save to transactions."""

import datetime
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
        """Extract bank name from sender email OR email body."""
        sender_lower = sender.lower()
        for domain, bank in BANK_SENDER_MAP.items():
            if domain in sender_lower:
                return bank

        # Fallback: check body for bank names
        body_lower = body.lower()[:500]  # first 500 chars
        if 'carbon' in body_lower:
            return 'Carbon'
        if 'gtb' in body_lower or 'gtbank' in body_lower:
            return 'GTB'
        if 'zenith' in body_lower:
            return 'Zenith'
        if 'access bank' in body_lower:
            return 'Access'
        if 'uba' in body_lower or 'united bank for africa' in body_lower:
            return 'UBA'
        if 'first bank' in body_lower:
            return 'First Bank'
        if 'kuda' in body_lower:
            return 'Kuda'
        if 'opay' in body_lower:
            return 'OPay'
        if 'palmpay' in body_lower:
            return 'PalmPay'
        if 'moniepoint' in body_lower:
            return 'Moniepoint'

        return 'Unknown'

    def _is_duplicate(self, user_id: str, gmail_id: str) -> bool:
        """Check if this gmail_id already saved for user OR previously deleted."""
        try:
            # Check transactions table
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

            # Check deleted_gmail_ids table
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
        # Step 1: Fetch from Gmail
        alerts = gmail_service.fetch_bank_alerts(
            user_id=user_id,
            max_results=max_results,
        )

        synced = 0
        skipped = 0
        failed = 0
        errors = []
        synced_transactions = []

        # Step 2: Process each alert
        for alert in alerts:
            gmail_id = alert.get('gmail_id', '')
            sender = alert.get('sender', '')
            body = alert.get('body', '')

            # 🚨 CRITICAL FIX: Cut off the email before the "Recent transactions" table
            # This stops the parser from grabbing old VAT charges and previous transfers
            body_lower = body.lower()
            if "recent transactions" in body_lower:
                body = body[:body_lower.index("recent transactions")].strip()

            # Skip duplicates
            if self._is_duplicate(user_id, gmail_id):
                skipped += 1
                continue

            # Skip empty
            if not body.strip():
                failed += 1
                continue

            # Detect bank
            bank = self._detect_bank(sender, body)

            # Parse
            try:
                parsed = self.parser.parse_to_dict(body)
            except Exception as e:
                failed += 1
                errors.append(f"Parse error: {str(e)[:100]}")
                continue

            # Require minimum fields: amount, type, date
            if not parsed.get('amount'):
                failed += 1
                errors.append(f"Missing amount for {gmail_id[:8]}")
                continue
            if not parsed.get('transaction_type'):
                failed += 1
                errors.append(f"Missing type for {gmail_id[:8]}")
                continue
            if not parsed.get('date'):
                # Skip newsletters / non-transaction emails silently
                skipped += 1
                continue

            # Categorize
            category = category_service.categorize(
                text=f"{parsed.get('merchant') or ''} {body}",
                transaction_type=parsed.get('transaction_type'),
            )

             # --- TIME FALLBACK LOGIC ---
            final_date = parsed["date"]
            
            # If the parser found a date but the time is exactly 00:00:00, use the email's received time
            if final_date and "00:00:00" in str(final_date):
                received_at = alert.get('received_at', '')
                if received_at:
                    try:
                        # Parse the email header date (e.g., "Fri, 16 Oct 2026 10:54:00 +0000")
                        from email.utils import parsedate_to_datetime
                        email_dt = parsedate_to_datetime(received_at)
                        # Extract just the date from the parsed string, and the time from the email
                        parsed_dt = datetime.fromisoformat(final_date)
                        final_date = parsed_dt.replace(
                            hour=email_dt.hour, 
                            minute=email_dt.minute, 
                            second=email_dt.second
                        ).isoformat()
                    except Exception:
                        pass # If it fails, just stick to the original parsed date

            # Prepare transaction
            transaction_data = {
                "user_id": user_id,
                "amount": parsed["amount"],
                "transaction_type": parsed["transaction_type"],
                "merchant": parsed.get("merchant"),
                "account_number": parsed.get("account_number"),
                "balance_after": parsed.get("balance"),
                "transaction_date": final_date, # <--- USE THE FALLBACK DATE
                "confidence": parsed.get("confidence", 0.0),
                "category": category,
                "bank_name": bank,
                "raw_text": f"gmail_id:{gmail_id}\n\n{body}",
            }
            
            # Save
            try:
                response = supabase.table("transactions").insert(transaction_data).execute()
                synced += 1
                # Save the inserted row to send back to the frontend
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

# Singleton
gmail_sync_service = GmailSyncService()