"""Gmail sync service — fetch alerts, parse, and save to transactions."""

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
        """Check if this gmail_id already saved for user."""
        try:
            response = (
                supabase.table("transactions")
                .select("id")
                .eq("user_id", user_id)
                .eq("raw_text", f"gmail_id:{gmail_id}")
                .limit(1)
                .execute()
            )
            return bool(response.data)
        except Exception:
            return False

    def sync_user_emails(self, user_id: str, max_results: int = 50) -> Dict:
        """
        Fetch user's bank alert emails, parse, save to transactions.
        Returns summary dict.
        """
        # Step 1: Fetch from Gmail
        alerts = gmail_service.fetch_bank_alerts(
            user_id=user_id,
            max_results=max_results,
        )

        synced = 0
        skipped = 0
        failed = 0
        errors = []

        # Step 2: Process each alert
        for alert in alerts:
            gmail_id = alert.get('gmail_id', '')
            sender = alert.get('sender', '')
            body = alert.get('body', '')

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

            # Prepare transaction
            transaction_data = {
                "user_id": user_id,
                "amount": parsed["amount"],
                "transaction_type": parsed["transaction_type"],
                "merchant": parsed.get("merchant"),
                "account_number": parsed.get("account_number"),
                "balance_after": parsed.get("balance"),
                "transaction_date": parsed["date"],
                "confidence": parsed.get("confidence", 0.0),
                "category": category,
                "bank_name": bank,
                "raw_text": f"gmail_id:{gmail_id}",
            }

            # Save
            try:
                supabase.table("transactions").insert(transaction_data).execute()
                synced += 1
            except Exception as e:
                failed += 1
                errors.append(f"Save error: {str(e)[:100]}")

        return {
            "total_fetched": len(alerts),
            "synced": synced,
            "skipped_duplicates": skipped,
            "failed": failed,
            "errors": errors[:10],
        }


# Singleton
gmail_sync_service = GmailSyncService()