"""Notification service — handle DB inserts for user alerts."""

from typing import Dict, List
from app.core.supabase_client import supabase


class NotificationService:
    """Create and manage notifications."""

    def create_notification(self, user_id: str, title: str, message: str, type: str = "info") -> Dict:
        """Insert a new notification into the database."""
        try:
            payload = {
                "user_id": user_id,
                "title": title,
                "message": message,
                "type": type,
            }
            response = supabase.table("notifications").insert(payload).execute()
            return response.data[0] if response.data else {}
        except Exception as e:
            print(f"Error creating notification: {str(e)}")
            return {}

    def get_notifications(self, user_id: str, limit: int = 50) -> List[Dict]:
        """Get recent notifications for a user."""
        try:
            response = (
                supabase.table("notifications")
                .select("*")
                .eq("user_id", user_id)
                .order("created_at", desc=True)
                .limit(limit)
                .execute()
            )
            return response.data or []
        except Exception as e:
            print(f"Error fetching notifications: {str(e)}")
            return []

    def mark_all_as_read(self, user_id: str) -> bool:
        """Mark all user notifications as read."""
        try:
            supabase.table("notifications").update({"is_read": True}).eq("user_id", user_id).execute()
            return True
        except Exception as e:
            print(f"Error marking notifications as read: {str(e)}")
            return False

    def clear_all(self, user_id: str) -> bool:
        """Delete all user notifications."""
        try:
            supabase.table("notifications").delete().eq("user_id", user_id).execute()
            return True
        except Exception as e:
            print(f"Error clearing notifications: {str(e)}")
            return False


# Singleton
notification_service = NotificationService()