"""
Regex-based parser for Nigerian bank alert emails.
Extracts structured fields: amount, date, account number, balance, transaction type.
"""

import re
from datetime import datetime
from typing import Optional


class RegexParser:
    """Extract structured fields from bank alert text using regex patterns."""

    AMOUNT_PATTERN = re.compile(
        r"(?:NGN|N|₦)\s*([\d,]+(?:\.\d{1,2})?)",
        re.IGNORECASE,
    )

    AMOUNT_KEYWORD_PATTERN = re.compile(
        # Standard: "Amount: NGN 5,000.00"
        r"(?:transaction\s+|credit\s+|debit\s+)?amount\s*:?\s*(?:NGN|N|₦)?\s*([\d,]+\.\d{2})"
        r"|"
        # "debit transaction of 5,010.00"
        r"\b(?:debit|credit)\s+transaction\s+of\s+(?:NGN|N|₦)?\s*([\d,]+\.\d{2})"
        r"|"
        # Carbon style: "*4,000.00*" or "amount of *4,000.00*"
        r"\b(?:debit|credit)\s+transaction\s+of\s+\*?([\d,]+\.\d{2})\*?",
        re.IGNORECASE,
    )

    AMOUNT_DRCR_PATTERN = re.compile(
        r"\b(?:amount|amt|transaction\s+amount)\s*:?\s*(?:NGN|N|₦)?\s*([\d,]+\.\d{2})\s*(DR|CR)\b",
        re.IGNORECASE,
    )

    ACCOUNT_PATTERN = re.compile(r"\b(\d{10})\b")

    DEBIT_KEYWORDS = r"\b(debit|debited|dr|withdrawn|purchase|transfer to|pos)\b"
    CREDIT_KEYWORDS = r"\b(credit|credited|cr|deposit|refund|received|transfer from|payment from|salary|sender)\b"

    BALANCE_KEYWORD_PATTERN = re.compile(
        r"(?:available\s+|cleared\s+|new\s+|avail(?:able)?\s+|closing\s+|current\s+|account\s+)?"
        r"bal(?:ance)?\s*:?\s*(?:NGN|N|₦)?\s*([\d,]+\.\d{1,2})",
        re.IGNORECASE,
    )

    DATE_PATTERNS = [
        # 15-09-2026 / 15-09-26 14:30
        re.compile(
            r"\b(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})(?:\s+(?:at\s+)?(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM|am|pm)?)?\b"
        ),
        # 15-Sep-2026 / 15-Sep-26 14:30
        re.compile(
            r"\b(\d{1,2})[-/]([A-Za-z]{3,9})[-/](\d{2,4})(?:\s+(?:at\s+)?(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM|am|pm)?)?\b"
        ),
        # Sep 14, 2026 18:15
        re.compile(
            r"\b([A-Za-z]{3,9})\s+(\d{1,2}),?\s+(\d{4})(?:\s+(?:at\s+)?(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM|am|pm)?)?\b"
        ),
        # 24 Sep, 2026 | 01:37:50 PM
        re.compile(
            r"\b(\d{1,2})\s+([A-Za-z]{3,9}),?\s+(\d{4})(?:\s*\|?\s*(?:at\s+)?(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM|am|pm)?)?\b"
        ),
        # ISO: 2026-09-29 (GTB style) — special handler
        re.compile(
            r"\b(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:\s+(?:at\s+)?(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM|am|pm)?)?\b"
        ),
    ]

    # Time-only pattern (for combining with date when separate)
    TIME_PATTERN = re.compile(
        r"(?:time\s+of\s+transaction|transaction\s+time|time)\s*:?\s*(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM|am|pm)?",
        re.IGNORECASE,
    )

    MONTH_MAP = {
        "jan": 1, "january": 1,
        "feb": 2, "february": 2,
        "mar": 3, "march": 3,
        "apr": 4, "april": 4,
        "may": 5,
        "jun": 6, "june": 6,
        "jul": 7, "july": 7,
        "aug": 8, "august": 8,
        "sep": 9, "sept": 9, "september": 9,
        "oct": 10, "october": 10,
        "nov": 11, "november": 11,
        "dec": 12, "december": 12,
    }

    def extract_amount(self, text: str) -> Optional[float]:
        """Extract transaction amount."""
        kw_match = self.AMOUNT_KEYWORD_PATTERN.search(text)
        if kw_match:
            # Try each captured group
            for g in kw_match.groups():
                if g:
                    try:
                        return float(g.replace(",", ""))
                    except ValueError:
                        continue

        drcr_match = self.AMOUNT_DRCR_PATTERN.search(text)
        if drcr_match:
            try:
                return float(drcr_match.group(1).replace(",", ""))
            except ValueError:
                pass

        matches = self.AMOUNT_PATTERN.findall(text)
        if matches:
            try:
                return float(matches[0].replace(",", ""))
            except ValueError:
                pass

        return None

    def extract_account_number(self, text: str) -> Optional[str]:
        """
        Extract 10-digit account number.
        Returns None for masked accounts (e.g., 2XX..60X).
        
        Strategy:
        - ONLY match when preceded by account keyword (Account, Acct, A/C)
        - Skip phone numbers (Nigerian format: starts with 70, 80, 81, 90, 91)
        - No random 10-digit fallback (prevents grabbing phone/ref numbers)
        """
        # Keyword-based ONLY
        account_kw = re.search(
            r"(?:account|acct|a/c)\s*(?:no\.?|number|name)?\s*:?\s*(\d{10})",
            text,
            re.IGNORECASE,
        )
        if account_kw:
            candidate = account_kw.group(1)
            if not self._is_nigerian_phone_number(candidate):
                return candidate

        # No fallback — return None for masked accounts
        return None

    def _is_nigerian_phone_number(self, num: str) -> bool:
        """Check if 10-digit number matches Nigerian phone pattern."""
        # Nigerian phone numbers (without leading 0) start with:
        # 70, 80, 81, 90, 91 (e.g., 803..., 814..., 706...)
        return bool(re.match(r"^[789][01]\d{8}$", num))

    def extract_balance(self, text: str) -> Optional[float]:
        """Extract balance."""
        kw_match = self.BALANCE_KEYWORD_PATTERN.search(text)
        if kw_match:
            try:
                return float(kw_match.group(1).replace(",", ""))
            except ValueError:
                pass

        fallback = re.search(
            r"(?:balance|bal)\s*:?\s*(?:NGN|N|₦)\s*([\d,]+(?:\.\d{1,2})?)",
            text,
            re.IGNORECASE,
        )
        if fallback:
            try:
                return float(fallback.group(1).replace(",", ""))
            except ValueError:
                pass

        return None

    def extract_transaction_type(self, text: str) -> Optional[str]:
        """Determine if transaction is debit or credit."""
        drcr_match = self.AMOUNT_DRCR_PATTERN.search(text)
        if drcr_match:
            suffix = drcr_match.group(2).upper()
            return "debit" if suffix == "DR" else "credit"

        explicit = re.search(
            r"\btype\s*:?\s*(debit|credit|dr|cr)\b",
            text,
            re.IGNORECASE,
        )
        if explicit:
            val = explicit.group(1).lower()
            if val in ("debit", "dr"):
                return "debit"
            if val in ("credit", "cr"):
                return "credit"

        phrase = re.search(r"\b(debit|credit)\s+transaction\b", text, re.IGNORECASE)
        if phrase:
            return phrase.group(1).lower()

        alert_type = re.search(r"\b(debit|credit)\s+alert\b", text, re.IGNORECASE)
        if alert_type:
            return alert_type.group(1).lower()

        # Uppercase detection: "A DEBIT transaction" / "A CREDIT transaction"
        upper_match = re.search(r"\bA\s+(DEBIT|CREDIT)\s+TRANSACTION\b", text)
        if upper_match:
            return upper_match.group(1).lower()

        passive = re.search(
            r"\b(?:has|was|been|is)\s+(debited|credited)\b",
            text,
            re.IGNORECASE,
        )
        if passive:
            return "debit" if passive.group(1).lower() == "debited" else "credit"

        dr_cr = re.search(r"^\s*(DR|CR)\s*$", text, re.MULTILINE | re.IGNORECASE)
        if dr_cr:
            val = dr_cr.group(1).upper()
            return "debit" if val == "DR" else "credit"

        text_lower = text.lower()
        debit_match = re.search(self.DEBIT_KEYWORDS, text_lower)
        credit_match = re.search(self.CREDIT_KEYWORDS, text_lower)

        if credit_match and not debit_match:
            return "credit"
        if debit_match and not credit_match:
            return "debit"
        if credit_match:
            return "credit"
        if debit_match:
            return "debit"
        return None

    def _extract_time_only(self, text: str) -> Optional[tuple]:
        """Extract time from 'Time of Transaction' keyword. Returns (hour, minute, second, ampm)."""
        match = self.TIME_PATTERN.search(text)
        if match:
            return (
                int(match.group(1)),
                int(match.group(2)),
                int(match.group(3)) if match.group(3) else 0,
                match.group(4),
            )
        return None

    def _parse_date_match(self, match: re.Match) -> Optional[datetime]:
        """Convert regex match into datetime object."""
        groups = match.groups()

        try:
            # ISO: 2026-09-29 (year first)
            if len(groups[0]) == 4 and groups[0].isdigit():
                year, month, day = int(groups[0]), int(groups[1]), int(groups[2])
            elif groups[0].isdigit() and groups[1].isdigit():
                day, month, year = int(groups[0]), int(groups[1]), int(groups[2])
            elif groups[1].isalpha():
                day = int(groups[0])
                month = self.MONTH_MAP.get(groups[1].lower()[:3], 1)
                year = int(groups[2])
            else:
                month = self.MONTH_MAP.get(groups[0].lower()[:3], 1)
                day = int(groups[1])
                year = int(groups[2])

            if year < 100:
                year += 2000

            hour = int(groups[3]) if len(groups) > 3 and groups[3] else 0
            minute = int(groups[4]) if len(groups) > 4 and groups[4] else 0
            second = int(groups[5]) if len(groups) > 5 and groups[5] else 0

            ampm = groups[6] if len(groups) > 6 and groups[6] else None
            if ampm:
                ampm = ampm.upper()
                if ampm == "PM" and hour < 12:
                    hour += 12
                elif ampm == "AM" and hour == 12:
                    hour = 0

            return datetime(year, month, day, hour, minute, second)

        except (ValueError, IndexError, TypeError):
            return None

    def extract_date(self, text: str) -> Optional[datetime]:
        """Extract transaction date/time."""
        # First try combined date+time patterns
        for pattern in self.DATE_PATTERNS:
            match = pattern.search(text)
            if match:
                parsed = self._parse_date_match(match)
                if parsed:
                    # If time is 00:00:00, try to find "Time of Transaction" and merge
                    if parsed.hour == 0 and parsed.minute == 0 and parsed.second == 0:
                        time_data = self._extract_time_only(text)
                        if time_data:
                            hour, minute, second, ampm = time_data
                            if ampm:
                                ampm = ampm.upper()
                                if ampm == "PM" and hour < 12:
                                    hour += 12
                                elif ampm == "AM" and hour == 12:
                                    hour = 0
                            parsed = parsed.replace(hour=hour, minute=minute, second=second)
                    return parsed
        return None
 
    def parse(self, text: str) -> dict:
        """Run all extractors and return combined result."""
        return {
            "amount": self.extract_amount(text),
            "account_number": self.extract_account_number(text),
            "balance": self.extract_balance(text),
            "transaction_type": self.extract_transaction_type(text),
            "date": self.extract_date(text),
        }