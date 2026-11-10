"""
Super Smart Auto-categorization service for transactions.
Uses keyword-based rules to assign categories.
"""

import re
from typing import Optional


class CategoryService:
    """Assign categories to transactions based on merchant/narration keywords."""

    CATEGORY_RULES = [
        # Work / Income
        {
            "category": "Work",
            "keywords": [
                r"\bsalary\b", r"\bfreelance\b", r"\binvoice\b", r"\bclient\b",
                r"\bbusiness\s+payment\b", r"\bdividend\b", r"\binterest\b",
                r"\bpayment\s+from\b", r"\bcredit\s+alert\b",
            ],
        },
        # Bills & Utilities
        {
            "category": "Bills",
            "keywords": [
                r"\bmtn\b", r"\bairtime\b", r"\bdata\b", r"\bdstv\b",
                r"\bgotv\b", r"\bstartimes\b", r"\belectricity\b", r"\blight\b",
                r"\bikedc\b", r"\bekedc\b", r"\bphcn\b", r"\bwater\s+bill\b",
                r"\bfip\s+charges\b", r"\bsms\s+charges\b", r"\bv[aá]t\b",
                r"\bcharges?\b",
            ],
        },
        # Entertainment (Subscriptions, etc.)
        {
            "category": "Entertainment",
            "keywords": [
                r"\bnetflix\b", r"\bspotify\b", r"\bapple\s+music\b",
                r"\byoutube\b", r"\bprime\s+video\b", r"\bshowmax\b",
                r"\bcinema\b", r"\bmovie\b", r"\bgame\b", r"\bsteam\b",
                r"\bsubscription\b",
            ],
        },
        # Healthcare
        {
            "category": "Healthcare",
            "keywords": [
                r"\bhospital\b", r"\bclinic\b", r"\bpharmacy\b", r"\bdoctor\b",
                r"\bmedplus\b", r"\bhealth\b", r"\bdrugs\b", r"\bmedical\b",
            ],
        },
        # Properties & Rent
        {
            "category": "Properties",
            "keywords": [
                r"\brent\b", r"\bhouse\b", r"\bland\b", r"\bproperty\b",
                r"\bagent\b", r"\bmaintenance\b", r"\bcaretaker\b", r"\bservice\s+charge\b",
            ],
        },
        # School & Education
        {
            "category": "School",
            "keywords": [
                r"\bschool\b", r"\btuition\b", r"\bfees\b", r"\bacademy\b",
                r"\buniversity\b", r"\budemy\b", r"\bcoursera\b", r"\bexam\b",
            ],
        },
        # Family & Personal
        {
            "category": "Family",
            "keywords": [
                r"\bmom\b", r"\bdad\b", r"\bbrother\b", r"\bsister\b",
                r"\bwife\b", r"\bhusband\b", r"\bfamily\b", r"\bchild\b",
            ],
        },
        # Gym & Fitness
        {
            "category": "Gym",
            "keywords": [
                r"\bgym\b", r"\bfitness\b", r"\bworkout\b", r"\btrainer\b",
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
        # Food & Dining
        {
            "category": "Food",
            "keywords": [
                r"\brestaurant\b", r"\bfood\b", r"\bcafe\b", r"\bchicken\s+republic\b",
                r"\bdominos\b", r"\bpizza\b", r"\bhungry\b", r"\bchowdeck\b",
                r"\bbolt\s+food\b", r"\beats?\b",
            ],
        },
        # Transfer (POS Withdrawals, P2P, NIP)
        {
            "category": "Transfer",
            "keywords": [
                r"\btransfer\s+to\b", r"\btransfer\s+from\b", r"\bpos\s+pur\b", 
                r"\bopay\b", r"\bpalmpay\b", r"\bkuda\b", r"\bcarbon\b", 
                r"\bmoniepoint\b", r"\bnip\b", r"\bmob\b", r"\buto\b", r"\btrf\b",
                r"\bwithdrawal\b", r"\bpos\s+withdrawal\b", r"\bcard\s+withdrawal\b",
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
        if not text:
            return self._fallback_category(transaction_type)

        text_lower = text.lower()

        for rule in self.CATEGORY_RULES:
            for keyword in rule["keywords"]:
                if re.search(keyword, text_lower):
                    return rule["category"]

        return self._fallback_category(transaction_type)

    def _fallback_category(self, transaction_type: Optional[str]) -> str:
        if transaction_type == "credit":
            return "Work"
        if transaction_type == "debit":
            return "Transfer"
        return "Miscellaneous"


# Singleton
category_service = CategoryService()