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

    def _clean_merchant_noise(self, text: str) -> str:
        if not text or text.startswith("gmail_id:"):
            return "Unknown Merchant"
            
        text = text.strip()

        # 1. UBA TNF pattern: "TNF-FAVOUR OROROGHAEBI/money from FAVOUR"
        # We want the part right after TNF- and before the slash
        if "TNF-" in text.upper():
            parts = re.split(r"TNF-", text, flags=re.IGNORECASE)
            if len(parts) > 1:
                text = parts[1].split("/")[0].strip()

        # 2. POS / Web Pur pattern: "Web Pur @ -DME*Spotify P4830 Lagos"
        # We want the word between the asterisks
        elif "*" in text and ("@" in text or "POS" in text.upper() or "WEB" in text.upper()):
            brand_match = re.search(r"\*(.+?)(?:\s|\*)", text)
            if brand_match:
                text = brand_match.group(1).strip()
            else:
                # Fallback if no closing space
                brand_match = re.search(r"\*(.+)", text)
                if brand_match:
                    text = brand_match.group(1).strip()

        # 3. Carbon NIP pattern: "NIP//123 - FROM OBISHAI VALENTINE//MOB/UTO"
        elif "NIP//" in text.upper():
            nip_match = re.search(r"NIP//\d+\s*-\s*FROM\s+(.+?)(?://|$)", text, re.IGNORECASE)
            if nip_match:
                text = nip_match.group(1).strip()

        # General cleanup
        text = re.sub(r"^(?:transfer\s+(?:from|to)|payment\s+(?:from|to))\s+", "", text, flags=re.IGNORECASE)
        text = text.split("*")[0] # Strip trailing asterisks
        text = re.sub(r"\d{1,2}-[A-Za-z]{3}-\d{4}.*", "", text, flags=re.IGNORECASE) 
        text = re.sub(r"Transaction\s+(?:Reference|Narration|Remarks)", "", text, flags=re.IGNORECASE)
        text = text.strip(" .,;:-_/")

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

    def extract_merchant(self, text: str) -> Optional[str]:
        if text.startswith("gmail_id:"): return "Unknown Merchant"

        # Priority 1: Narration
        narration = self._extract_field_after_keyword(text, r"\bnarration\b")
        if narration and narration != "Unknown Merchant": return narration

        # Priority 2: Description
        description = self._extract_field_after_keyword(text, r"\bdescription\b")
        if description and description != "Unknown Merchant": return description

        # Priority 3: Sender
        sender = self._extract_field_after_keyword(text, r"\bsender(?:'s)?\s*(?:name)?\b")
        if sender and sender != "Unknown Merchant": return sender

        # Priority 4: Fallback to Account Name (crucial for UBA emails without narration)
        account_name = self._extract_field_after_keyword(text, r"\baccount\s+name\b")
        if account_name and account_name != "Unknown Merchant": return account_name

        # Priority 5: SpaCy Fallback
        doc = self.nlp(text)
        entities = [ent.text for ent in doc.ents if ent.label_ in ("PERSON", "ORG")]
        if entities:
            best = max(entities, key=len)
            cleaned = self._clean_merchant_noise(best)
            if cleaned != "Unknown Merchant": return cleaned

        return "Unknown Merchant"

    def parse(self, text: str) -> dict:
        return {"merchant": self.extract_merchant(text)}