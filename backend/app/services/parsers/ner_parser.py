"""
NER-based parser for Nigerian bank alerts.
"""

import spacy
from typing import Optional, List
import re


class NERParser:
    def __init__(self):
        self.nlp = spacy.load("en_core_web_sm")
        self.noise_words = [
            "transfer", "payment", "refund", "purchase", "debit",
            "credit", "alert", "transaction", "narration", "description",
            "details", "beneficiary", "sender", "to", "from", "by",
            "via", "on", "at", "mobile", "trf", "mob", "uto",
        ]

    def _clean_extracted_text(self, text: str) -> str:
        text = re.sub(r"\s+", " ", text)
        return text.strip(" .,;:-")

    def _clean_merchant_noise(self, text: str) -> str:
        if not text or text.startswith("gmail_id:"):
            return "Unknown Merchant"
            
        text = text.strip()

        # 1. Extract from Carbon NIP string: "NIP//123 - FROM OBISHAI VALENTINE//..."
        nip_match = re.search(r"NIP//\d+\s*-\s*FROM\s+(.+?)(?://|$)", text, re.IGNORECASE)
        if nip_match:
            text = nip_match.group(1).strip()

        # 2. Extract from UBA MOB/UTO string: "MOB/UTO/CHRISTABEL OSE/fund/123"
        mob_match = re.search(r"MOB/UTO/(.+?)(?:/|$)", text, re.IGNORECASE)
        if mob_match:
            text = mob_match.group(1).strip()

        # 3. Extract from UBA TNF string: "TNF-Favour..."
        if "TNF-" in text.upper():
            text = re.sub(r"^.*TNF-", "", text, flags=re.IGNORECASE)
            text = text.split("/")[0].strip()

        # 4. Extract POS Brand: "Web Pur @ -DME*Spotify P4830 Lagos"
        if "*" in text and ("@" in text or "POS" in text.upper() or "WEB" in text.upper()):
            brand_match = re.search(r"\*(.+?)[\*\s]", text)
            if brand_match:
                text = brand_match.group(1).strip()

        # 5. General cleanup
        text = re.sub(r"^(?:transfer\s+(?:from|to)|payment\s+(?:from|to))\s+", "", text, flags=re.IGNORECASE)
        text = text.split("*")[0] # Strip Carbon VAT asterisks
        text = re.sub(r"\d{1,2}-[A-Za-z]{3}-\d{4}.*", "", text, flags=re.IGNORECASE) # Strip dates
        
        # 6. Remove structural noise words if they got captured
        text = text.replace("Transaction Reference", "").replace("Transaction Narration", "").replace("Transaction Remarks", "").replace("Description", "").strip()
        text = text.strip(" .,;:-")

        if len(text) < 3 or not re.search(r"[a-zA-Z]", text):
            return "Unknown Merchant"

        return text

    def _extract_field_after_keyword(self, text: str, keyword_pattern: str) -> Optional[str]:
        stop_keywords = (
            r"(?:date|time|account|acct|a/c|amount|amt|balance|bal|"
            r"narration|description|details|sender|beneficiary|"
            r"reference|value\s+date|currency|remarks|location|"
            r"recent\s+transactions|vat\s+charge|open\s+app)"
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

    def _extract_narrative_line(self, text: str) -> Optional[str]:
        # Priority 1: Narration
        narration = self._extract_field_after_keyword(text, r"\bnarration\b")
        if narration and narration != "Unknown Merchant": return narration

        # Priority 2: Description
        description = self._extract_field_after_keyword(text, r"\bdescription\b")
        if description and description != "Unknown Merchant": return description

        # Priority 3: Sender
        sender = self._extract_field_after_keyword(text, r"\bsender(?:'s)?\s*(?:name)?\b")
        if sender and sender != "Unknown Merchant": return sender

        return None

    def extract_merchant(self, text: str) -> Optional[str]:
        if text.startswith("gmail_id:"): return "Unknown Merchant"

        narrative = self._extract_narrative_line(text)
        if narrative: return narrative

        # Fallback to NER
        doc = self.nlp(text)
        entities = [ent.text for ent in doc.ents if ent.label_ in ("PERSON", "ORG")]
        if entities:
            best = max(entities, key=len)
            cleaned = self._clean_merchant_noise(best)
            if cleaned != "Unknown Merchant": return cleaned

        return "Unknown Merchant"

    def parse(self, text: str) -> dict:
        return {"merchant": self.extract_merchant(text)}