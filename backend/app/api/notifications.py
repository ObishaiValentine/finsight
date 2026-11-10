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

@router.post("/test")
def test_notification(current_user: dict = Depends(get_current_user)):
    """Manually trigger a notification to test DB connection."""
    from app.services.notification_service import notification_service
    try:
        res = notification_service.create_notification(
            user_id=str(current_user["id"]),
            title="Test Notification",
            message="This is a test to ensure Supabase is receiving alerts.",
            type="info"
        )
        if not res:
            return {"error": "Notification service returned empty. Check Render backend logs for the CRITICAL NOTIFICATION ERROR."}
        return {"success": True, "data": res}
    except Exception as e:
        return {"error": str(e)}