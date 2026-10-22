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
        return text.strip(" .,;:-")

    def _clean_merchant_noise(self, text: str) -> str:
        """Clean merchant name from noise."""
        if not text or text.startswith("gmail_id:"):
            return "Unknown Merchant"
            
        # 1. Remove transfer prefixes
        text = re.sub(r"^(?:transfer\s+(?:from|to)|payment\s+(?:from|to)|from|to)\s+", "", text, flags=re.IGNORECASE)

        # 2. POS prefix
        text = re.sub(r"^pos\s+pur(?:chase)?\s*@?\s*", "", text, flags=re.IGNORECASE)
        text = re.sub(r"^pos\s+", "", text, flags=re.IGNORECASE)

        # 3. NIP prefix
        text = re.sub(r"^nip//\d+\s*-\s*", "", text, flags=re.IGNORECASE)
        text = re.sub(r"^nip//\d+\s*", "", text, flags=re.IGNORECASE)
        text = re.sub(r"^nip//\s*", "", text, flags=re.IGNORECASE)

        # 4. UBA TNF pattern (Fixes "TNF-Valentine Obishai/...")
        tnf_match = re.search(r"TNF-(.+?)(?:/|$)", text, re.IGNORECASE)
        if tnf_match:
            text = tnf_match.group(1).strip()
            text = re.sub(r"^[/-]", "", text).strip()

        # 5. UBA MOB/UTO pattern
        mob_match = re.match(r"^mob/uto/([^/]+)/", text, re.IGNORECASE)
        if mob_match:
            text = mob_match.group(1).strip()

        # 6. BRUTE FORCE: Strip everything after an asterisk (Fixes Carbon "* - 0.75 *")
        text = text.split('*')[0]
        
        # 7. BRUTE FORCE: Strip trailing dates (Fixes "11-Oct-2026 Transfer from...")
        text = re.sub(r"\d{1,2}-[A-Za-z]{3}-\d{4}.*", "", text, flags=re.IGNORECASE)
        
        # 8. Remove long IDs
        text = re.sub(r"\b[A-Z]{2,}\d{10,}\b", "", text)
        text = re.sub(r"\b[A-Z0-9]{7,10}\b\s*[-]?\s*", " ", text)
        text = re.sub(r"\b\d{6,}\b\s*/?\s*", " ", text)

        # 9. Collapse whitespace
        text = re.sub(r"\s+", " ", text).strip(" .,;:-*")

        # 10. Invalid phrases
        invalid_phrases = ["are below", "below", "summary", "details", "alert", "notification", "s name", "name", "s name:", "vat charge", "transaction"]
        if text.lower() in invalid_phrases or len(text) < 3 or not re.search(r"[a-zA-Z]", text):
            return "Unknown Merchant"

        return text

    def _extract_field_after_keyword(self, text: str, keyword_pattern: str) -> Optional[str]:
        stop_keywords = (
            r"(?:date|time|account\s+number|account|acct|a/c|"
            r"amount|amt|balance|bal|cleared\s+balance|uncleared\s+balance|"
            r"available\s+balance|current\s+balance|narration|description|"
            r"details|sender|beneficiary|transaction\s+reference|reference|"
            r"value\s+date|currency|transaction\s+type|transaction\s+date|"
            r"remarks|transaction\s+remarks|document\s+number|"
            r"transaction\s+location|time\s+of\s+transaction|"
            r"recent\s+transactions|vat\s+charge|"
            r"open\s+app|the\s+carbon\s+team)"
        )

        pattern = re.compile(rf"{keyword_pattern}\s*:?\s*([\s\S]+?)(?:\s+(?:{stop_keywords})\s*:|\Z)", re.IGNORECASE)
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

    def _extract_carbon_merchant(self, text: str) -> Optional[str]:
        nip_match = re.search(r"NIP//\d+\s*-\s*FROM\s+([A-Z][A-Z\s]+?)(?://|$)", text, re.IGNORECASE)
        if nip_match:
            name = nip_match.group(1).strip()
            if len(name) > 3:
                return self._clean_merchant_noise(name)
        return None

    def _extract_narrative_line(self, text: str) -> Optional[str]:
        narration = self._extract_field_after_keyword(text, r"\bnarration\b")
        if narration and self._is_valid_entity(narration): return narration

        description = self._extract_field_after_keyword(text, r"\bdescription\b")
        if description and self._is_valid_entity(description): return description

        sender = self._extract_field_after_keyword(text, r"\bsender(?:'s)?\s*(?:name)?\b")
        if sender and self._is_valid_entity(sender): return sender

        beneficiary = self._extract_field_after_keyword(text, r"\bbeneficiary(?:'s)?\s*(?:name)?\b")
        if beneficiary and self._is_valid_entity(beneficiary): return beneficiary

        transfer = self._extract_field_after_keyword(text, r"\btransfer\s+(?:to|from)\b")
        if transfer and self._is_valid_entity(transfer): return transfer

        return None

    def _is_valid_entity(self, entity_text: str) -> bool:
        text_lower = entity_text.lower().strip()
        if len(text_lower) < 3: return False
        if text_lower in self.noise_words: return False
        if not re.search(r"[a-zA-Z]", text_lower): return False
        return True

    def extract_merchant(self, text: str) -> Optional[str]:
        if text.startswith("gmail_id:"): return "Unknown Merchant"

        carbon_merchant = self._extract_carbon_merchant(text)
        if carbon_merchant and self._is_valid_entity(carbon_merchant): return carbon_merchant

        narrative = self._extract_narrative_line(text)
        if narrative and self._is_valid_entity(narrative): return narrative

        doc = self.nlp(text)
        entities = [ent.text for ent in doc.ents if ent.label_ in ("PERSON", "ORG") and self._is_valid_entity(ent.text)]
        if entities:
            return self._clean_merchant_noise(max(entities, key=len))

        return "Unknown Merchant"
    
    def extract_entities(self, text: str) -> List[dict]:
        doc = self.nlp(text)
        return [{"text": ent.text, "label": ent.label_} for ent in doc.ents]

    def parse(self, text: str) -> dict:
        return {"merchant": self.extract_merchant(text), "entities": self.extract_entities(text)}