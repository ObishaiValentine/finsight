"""
Auto-categorization service for transactions.
Uses keyword-based rules to assign categories.
"""

import re
from typing import Optional


class CategoryService:
    """Assign categories to transactions based on merchant/narration keywords."""

    # Category rules — order matters (first match wins)
    CATEGORY_RULES = [
        # Income
        {
            "category": "Income",
            "keywords": [
                r"\bsalary\b", r"\bpayment\s+from\b", r"\bcredit\s+alert\b",
                r"\bdividend\b", r"\bfreelance\b", r"\bbusiness\s+payment\b",
                r"\bsender\b", r"\bcredit\s+transaction\b", r"\breceived\b",
                r"\btransfer\s+from\b", r"\bdeposit\b",
            ],
        },
        # Bills & Utilities
        {
            "category": "Bills",
            "keywords": [
                r"\bmtn\b", r"\bairtime\b", r"\bdata\b", r"\bdstv\b",
                r"\bgotv\b", r"\bstartimes\b", r"\belectricity\b",
                r"\bikedc\b", r"\bekedc\b", r"\bphcn\b", r"\bwater\s+bill\b",
                r"\bfip\s+charges\b", r"\bsms\s+charges\b", r"\bv[aá]t\b",
                r"\bsubscription\b", r"\bsms\b", r"\bcharges?\b",
            ],
        },
        # Shopping
        {
            "category": "Shopping",
            "keywords": [
                r"\bshoprite\b", r"\bmarket\s*square\b", r"\bjumia\b",
                r"\bkonga\b", r"\bpos\s+purchase\b", r"\bpurchase\b",
                r"\bsupermarket\b", r"\bmall\b", r"\bstore\b",
            ],
        },
        # Transportation
        {
            "category": "Transport",
            "keywords": [
                r"\buber\b", r"\bbolt\b", r"\bopay\s+ride\b", r"\bflight\b",
                r"\bairline\b", r"\btransport\b", r"\bfuel\b", r"\bpetrol\b",
                r"\btoll\b", r"\btaxi\b", r"\btrain\b", r"\bbus\b",
            ],
        },
        # Entertainment
        {
            "category": "Entertainment",
            "keywords": [
                r"\bnetflix\b", r"\bspotify\b", r"\bapple\s+music\b",
                r"\byoutube\b", r"\bprime\s+video\b", r"\bshowmax\b",
                r"\bcinema\b", r"\bmovie\b", r"\bgame\b", r"\bsteam\b",
            ],
        },
        # Food & Dining
        {
            "category": "Food",
            "keywords": [
                r"\brestaurant\b", r"\bfood\b", r"\bcafe\b", r"\bchicken\s+republic\b",
                r"\bdominos\b", r"\bpizza\b", r"\bhungry\b", r"\bchowdeck\b",
                r"\bbolt\s+food\b", r"\beats?\b",
            ],
        },
        # Transfer (highest priority for outgoing transfers)
        {
            "category": "Transfer",
            "keywords": [
                r"\btransfer\s+to\b", r"\bpos\s+pur\b", r"\bopay\b",
                r"\bpalmpay\b", r"\bkuda\b", r"\bcarbon\b", r"\bmoniepoint\b",
            ],
        },
        # Refund
        {
            "category": "Refund",
            "keywords": [
                r"\brefund\b", r"\breversal\b", r"\breversed\b",
            ],
        },
    ]

    def categorize(self, text: str, transaction_type: Optional[str] = None) -> str:
        """
        Assign a category based on text content.
        
        Args:
            text: merchant name + narration + description
            transaction_type: 'debit' or 'credit' (used as fallback)
        
        Returns:
            Category string
        """
        if not text:
            return self._fallback_category(transaction_type)

        text_lower = text.lower()

        for rule in self.CATEGORY_RULES:
            for keyword in rule["keywords"]:
                if re.search(keyword, text_lower):
                    return rule["category"]

        return self._fallback_category(transaction_type)

    def _fallback_category(self, transaction_type: Optional[str]) -> str:
        """Fallback category based on transaction type."""
        if transaction_type == "credit":
            return "Income"
        if transaction_type == "debit":
            return "Other"
        return "Uncategorized"


# Singleton
category_service = CategoryService()