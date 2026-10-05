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
        text = re.sub(r"\s+", " ", text)
        text = text.strip(" .,;:-")
        return text

    def _clean_merchant_noise(self, text: str) -> str:
        """Clean merchant name from noise."""
        # Remove leading prefixes
        text = re.sub(
            r"^(?:transfer\s+(?:from|to)|payment\s+(?:from|to)|from|to)\s+",
            "",
            text,
            flags=re.IGNORECASE,
        )

        # Remove POS prefix + transaction ID
        text = re.sub(r"^pos\s+pur(?:chase)?\s*@?\s*", "", text, flags=re.IGNORECASE)
        text = re.sub(r"^pos\s+", "", text, flags=re.IGNORECASE)

        # Remove LEADING long numeric sequence (GTB style: 000013260929145737000026510742)
        text = re.sub(r"^\d{15,}\s*", "", text)

        # Remove any other long numeric sequences
        text = re.sub(r"\b\d{10,}\b", " ", text)

        # Remove standalone alphanumeric IDs (like 257ZHQT9)
        text = re.sub(r"\b[A-Z0-9]{7,10}\b\s*[-]?\s*", " ", text)

        # Take FIRST segment before " - " if there are multiple segments
        # (GTB style: "SNACKS TO OPAY - PONNAN BINDUL VONGZING" → "SNACKS TO OPAY")
        if " - " in text:
            parts = text.split(" - ")
            # Prefer shorter first part (merchant name typically shorter than person name)
            if len(parts) > 1 and len(parts[0]) <= len(parts[1]):
                text = parts[0]

        # Remove trailing short uppercase location code
        text = re.sub(r"\s+[A-Z]{1,2}$", "", text)

        # Collapse whitespace
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
        """Extract value after a field keyword."""
        stop_keywords = (
            r"(?:date|time\s+of\s+transaction|account\s+number|account|acct|a/c|"
            r"amount|amt|balance|bal|cleared\s+balance|uncleared\s+balance|"
            r"available\s+balance|current\s+balance|narration|description|"
            r"details|sender|beneficiary|transaction\s+reference|reference|"
            r"value\s+date|currency|transaction\s+type|transaction\s+date|"
            r"remarks|document\s+number|transaction\s+location)"
        )

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
        """Extract merchant/narrative."""
        # Priority 1: Description
        desc = self._extract_field_after_keyword(text, r"\bdescription\b")
        if desc and self._is_valid_entity(desc):
            return desc

        # Priority 2: Narration
        narration = self._extract_field_after_keyword(text, r"\bnarration\b")
        if narration and self._is_valid_entity(narration):
            return narration

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
        text_lower = entity_text.lower().strip()
        if len(text_lower) < 3:
            return False
        if text_lower in self.noise_words:
            return False
        if not re.search(r"[a-zA-Z]", text_lower):
            return False
        return True

    def extract_merchant(self, text: str) -> Optional[str]:
        narrative = self._extract_narrative_line(text)
        if narrative and self._is_valid_entity(narrative):
            return narrative

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