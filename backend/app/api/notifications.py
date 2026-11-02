"""Notification API endpoints."""

from fastapi import APIRouter, Depends
from app.services.notification_service import notification_service
from app.api.deps import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("")
def get_notifications(current_user: dict = Depends(get_current_user)):
    """Get recent notifications."""
    return notification_service.get_notifications(current_user["id"])

@router.post("/mark-read")
def mark_all_read(current_user: dict = Depends(get_current_user)):
    """Mark all notifications as read."""
    notification_service.mark_all_as_read(current_user["id"])
    return {"message": "Marked as read"}

@router.delete("")
def clear_notifications(current_user: dict = Depends(get_current_user)):
    """Clear all notifications."""
    notification_service.clear_all(current_user["id"])
    return {"message": "Cleared"}