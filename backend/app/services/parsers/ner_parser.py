"""
NER-based parser using spaCy for extracting merchant names and narratives
from Nigerian bank alert emails.
"""

import spacy
from typing import Optional, List
import re


class NERParser:
    """Extract merchant/narrative entities using spaCy NER + custom patterns."""

    def __init__(self):
        self.nlp = spacy.load("en_core_web_sm")

        self.noise_words = [
            "transfer", "payment", "refund", "purchase", "debit",
            "credit", "alert", "transaction", "narration", "description",
            "details", "beneficiary", "sender", "to", "from", "by",
            "via", "on", "at",
        ]

    def _clean_extracted_text(self, text: str) -> str:
        """Clean and normalize extracted narrative text."""
        text = re.sub(r"\s+", " ", text)
        text = text.strip(" .,;:-")
        return text

    def _clean_merchant_noise(self, text: str) -> str:
        """Clean merchant name from noise."""
        text = re.sub(
            r"^(?:transfer\s+(?:from|to)|payment\s+(?:from|to)|from|to)\s+",
            "",
            text,
            flags=re.IGNORECASE,
        )

        text = re.sub(r"^pos\s+pur(?:chase)?\s*@?\s*", "", text, flags=re.IGNORECASE)
        text = re.sub(r"^pos\s+", "", text, flags=re.IGNORECASE)

        # Remove long alphanumeric IDs
        text = re.sub(r"\b[A-Z]{2,}\d{10,}\b", "", text)

        # Remove standalone alphanumeric IDs (7-10 chars)
        text = re.sub(r"\b[A-Z0-9]{7,10}\b\s*[-]?\s*", " ", text)

        # Remove long numeric sequences
        text = re.sub(r"\b\d{6,}\b\s*/?\s*", " ", text)

        # Truncate at common stop-words if they slip through
        stop_words = [
            "transaction remarks", "date and time", "available balance",
            "cleared balance", "value date", "transaction location",
            "transaction reference",
        ]
        for stop in stop_words:
            if stop in text.lower():
                text = text[:text.lower().index(stop)]

        # Remove trailing short uppercase location code
        text = re.sub(r"\s+[A-Z]{1,2}$", "", text)

        # Collapse whitespace + strip
        text = re.sub(r"\s+", " ", text).strip()

        # Invalid phrases
        invalid_phrases = [
            "are below", "below", "summary", "details", "alert",
            "notification", "s name", "name", "s name:",
        ]
        if text.lower() in invalid_phrases:
            return ""

        return text

    def _extract_field_after_keyword(self, text: str, keyword_pattern: str) -> Optional[str]:
        """Extract value after a field keyword with stop conditions."""
        stop_keywords = (
            r"(?:date|time|account\s+number|account|acct|a/c|"
            r"amount|amt|balance|bal|cleared\s+balance|uncleared\s+balance|"
            r"available\s+balance|current\s+balance|narration|description|"
            r"details|sender|beneficiary|transaction\s+reference|reference|"
            r"value\s+date|currency|transaction\s+type|transaction\s+date|"
            r"remarks|transaction\s+remarks|document\s+number|"
            r"transaction\s+location|time\s+of\s+transaction)"
        )

        # Match keyword, capture value, stop at next field keyword
        # Allow whitespace between keyword and value (handles collapsed text)
        pattern = re.compile(
            rf"{keyword_pattern}\s*:?\s*"
            rf"([\s\S]+?)"
            rf"(?:\s+(?:{stop_keywords})\s*:|\Z)",
            re.IGNORECASE,
        )

        match = pattern.search(text)
        if match:
            raw = match.group(1).strip()
            # Take only first line if multiline
            first_line = raw.split("\n")[0].strip()
            if not first_line:
                for line in raw.split("\n"):
                    line = line.strip()
                    if line:
                        first_line = line
                        break
            if first_line:
                return self._clean_merchant_noise(first_line)

        return None

        pattern = re.compile(
            rf"{keyword_pattern}\s*:?\s*"
            rf"([\s\S]+?)"
            rf"(?=\s*\n\s*(?:{stop_keywords})\b|\Z)",
            re.IGNORECASE,
        )

        match = pattern.search(text)
        if match:
            raw = match.group(1).strip()
            first_line = raw.split("\n")[0].strip()
            if not first_line:
                for line in raw.split("\n"):
                    line = line.strip()
                    if line:
                        first_line = line
                        break
            if first_line:
                return self._clean_merchant_noise(first_line)

        return None

    def _extract_narrative_line(self, text: str) -> Optional[str]:
        """
        Extract merchant/narrative.
        Priority (by reliability):
        1. Narration (most common in NG bank alerts)
        2. Description
        3. Sender / Beneficiary
        4. Transfer from/to
        """
        # Priority 1: Narration
        narration = self._extract_field_after_keyword(text, r"\bnarration\b")
        if narration and self._is_valid_entity(narration):
            return narration

        # Priority 2: Description
        description = self._extract_field_after_keyword(text, r"\bdescription\b")
        if description and self._is_valid_entity(description):
            return description

        # Priority 3: Sender
        sender = self._extract_field_after_keyword(text, r"\bsender(?:'s)?\s*(?:name)?\b")
        if sender and self._is_valid_entity(sender):
            return sender

        # Priority 4: Beneficiary
        beneficiary = self._extract_field_after_keyword(text, r"\bbeneficiary(?:'s)?\s*(?:name)?\b")
        if beneficiary and self._is_valid_entity(beneficiary):
            return beneficiary

        # Priority 5: Transfer from/to
        transfer = self._extract_field_after_keyword(text, r"\btransfer\s+(?:to|from)\b")
        if transfer and self._is_valid_entity(transfer):
            return transfer

        return None

    def _is_valid_entity(self, entity_text: str) -> bool:
        """Check if entity text is valid."""
        text_lower = entity_text.lower().strip()
        if len(text_lower) < 3:
            return False
        if text_lower in self.noise_words:
            return False
        if not re.search(r"[a-zA-Z]", text_lower):
            return False
        return True

    def extract_merchant(self, text: str) -> Optional[str]:
        """Extract merchant/beneficiary name."""
        # Priority 1: Narrative line patterns
        narrative = self._extract_narrative_line(text)
        if narrative and self._is_valid_entity(narrative):
            return narrative

        # Priority 2: spaCy NER fallback
        doc = self.nlp(text)
        entities = []
        for ent in doc.ents:
            if ent.label_ in ("PERSON", "ORG"):
                if self._is_valid_entity(ent.text):
                    entities.append(ent.text)

        if entities:
            return self._clean_extracted_text(max(entities, key=len))

        return None

    def extract_entities(self, text: str) -> List[dict]:
        """Extract ALL entities (for debugging)."""
        doc = self.nlp(text)
        return [
            {"text": ent.text, "label": ent.label_}
            for ent in doc.ents
        ]

    def parse(self, text: str) -> dict:
        return {
            "merchant": self.extract_merchant(text),
            "entities": self.extract_entities(text),
        }