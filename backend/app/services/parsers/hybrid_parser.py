"""
Hybrid Regex-NER parser — the core algorithm of FinSight.

Strategy:
1. Use Regex for structured fields (amount, account, balance, type, date)
2. Use NER for unstructured fields (merchant, narrative)
3. Combine results with confidence scoring
"""

from typing import Optional, Dict, Any
from datetime import datetime

from app.services.parsers.regex_parser import RegexParser
from app.services.parsers.ner_parser import NERParser


class HybridParser:
    """
    Hybrid Regex-NER parser for Nigerian bank alert emails.
    
    This is the core contribution of FinSight:
    - Regex handles deterministic, structured fields fast
    - NER handles variable-format narrative fields
    - Confidence scoring flags low-quality extractions
    """

    def __init__(self):
        self.regex_parser = RegexParser()
        self.ner_parser = NERParser()

    def _calculate_confidence(self, result: Dict[str, Any]) -> float:
        """
        Calculate confidence score (0.0 - 1.0) based on how many fields
        were successfully extracted.
        """
        required_fields = ["amount", "transaction_type", "date"]
        optional_fields = ["account_number", "balance", "merchant"]

        required_score = sum(1 for f in required_fields if result.get(f) is not None) / len(required_fields)
        optional_score = sum(1 for f in optional_fields if result.get(f) is not None) / len(optional_fields)

        # Weighted: 70% required, 30% optional
        confidence = (required_score * 0.7) + (optional_score * 0.3)
        return round(confidence, 3)

    def parse(self, text: str) -> Dict[str, Any]:
        """
        Run both parsers and combine results.
        
        Returns:
            dict with all extracted fields + confidence score
        """
        # Step 1: Regex extraction (structured fields)
        regex_result = self.regex_parser.parse(text)

        # Step 2: NER extraction (narrative fields)
        ner_result = self.ner_parser.parse(text)

        # Step 3: Combine
        result = {
            # Structured (from Regex)
            "amount": regex_result["amount"],
            "account_number": regex_result["account_number"],
            "balance": regex_result["balance"],
            "transaction_type": regex_result["transaction_type"],
            "date": regex_result["date"],
            # Narrative (from NER)
            "merchant": ner_result["merchant"],
            # Metadata
            "raw_text": text,
        }

        # Step 4: Confidence score
        result["confidence"] = self._calculate_confidence(result)

        return result

    def parse_to_dict(self, text: str) -> Dict[str, Any]:
        """Same as parse() but with serializable datetime (ISO format)."""
        result = self.parse(text)
        if result["date"]:
            result["date"] = result["date"].isoformat()
        return result