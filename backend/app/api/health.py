from fastapi import APIRouter
from datetime import datetime

from app.core.config import settings

router = APIRouter(tags=["Health"])


@router.get("/health")
def health_check():
    """Check if the API is running and healthy."""
    return {
        "status": "healthy",
        "service": f"{settings.app_name} Backend",
        "version": settings.app_version,
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/ping")
def ping():
    """Simple ping endpoint for uptime monitoring."""
    return {"ping": "pong"}