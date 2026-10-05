"""
API endpoints for the Hybrid Regex-NER parser.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional

from app.services.parsers.hybrid_parser import HybridParser
from app.services.parsers.sample_alerts import SAMPLE_ALERTS

router = APIRouter(prefix="/parser", tags=["Parser"])

# Single parser instance (reuse across requests)
hybrid_parser = HybridParser()


# ===== Schemas =====

class ParseRequest(BaseModel):
    text: str = Field(..., min_length=10, description="Bank alert email text")


class ParsedTransaction(BaseModel):
    amount: Optional[float] = None
    transaction_type: Optional[str] = None
    date: Optional[str] = None
    account_number: Optional[str] = None
    balance: Optional[float] = None
    merchant: Optional[str] = None
    confidence: float


# ===== Endpoints =====

@router.post("/parse", response_model=ParsedTransaction)
def parse_alert(request: ParseRequest):
    """
    Parse a single bank alert email.
    
    Extracts: amount, type, date, account, balance, merchant.
    Returns confidence score (0.0 - 1.0).
    """
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    try:
        result = hybrid_parser.parse_to_dict(request.text)
        return ParsedTransaction(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Parsing failed: {str(e)}")


@router.post("/parse-batch", response_model=List[ParsedTransaction])
def parse_batch(alerts: List[ParseRequest]):
    """Parse multiple alerts at once."""
    results = []
    for alert in alerts:
        try:
            result = hybrid_parser.parse_to_dict(alert.text)
            results.append(ParsedTransaction(**result))
        except Exception:
            # Skip failures, continue with others
            continue
    return results


@router.get("/samples", tags=["Parser"])
def get_sample_alerts():
    """Get sample alerts for testing."""
    return SAMPLE_ALERTS


@router.get("/parse-sample/{alert_id}", response_model=ParsedTransaction)
def parse_sample(alert_id: int):
    """Parse one of the sample alerts by ID."""
    alert = next((a for a in SAMPLE_ALERTS if a["id"] == alert_id), None)
    if not alert:
        raise HTTPException(status_code=404, detail="Sample alert not found")

    result = hybrid_parser.parse_to_dict(alert["body"])
    return ParsedTransaction(**result)