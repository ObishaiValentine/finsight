"""Gmail integration API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import RedirectResponse

from app.services.gmail_service import gmail_service
from app.services.auth_service import auth_service
from app.api.deps import get_current_user

router = APIRouter(prefix="/gmail", tags=["Gmail"])


@router.get("/connect")
def get_auth_url(current_user: dict = Depends(get_current_user)):
    """Get Google OAuth URL for Gmail connection."""
    auth_url = gmail_service.get_auth_url(current_user["id"])
    return {"auth_url": auth_url}


@router.get("/callback")
def oauth_callback(
    code: str = Query(...),
    state: str = Query(...),
    error: str = Query(None),
):
    """
    Handle Google OAuth callback.
    `state` contains the user_id we passed in get_auth_url.
    """
    if error:
        return RedirectResponse(
            url=f"{'http://localhost:5173'}/accounts?gmail=error",
            status_code=status.HTTP_302_FOUND,
        )

    try:
        result = gmail_service.handle_callback(code=code, user_id=state)
        return RedirectResponse(
            url=f"{'http://localhost:5173'}/accounts?gmail=success&email={result['gmail_email']}",
            status_code=status.HTTP_302_FOUND,
        )
    except HTTPException as e:
        return RedirectResponse(
            url=f"{'http://localhost:5173'}/accounts?gmail=error",
            status_code=status.HTTP_302_FOUND,
        )


@router.get("/status")
def gmail_status(current_user: dict = Depends(get_current_user)):
    """Check if user's Gmail is connected."""
    try:
        from app.core.supabase_client import supabase
        response = (
            supabase.table("users")
            .select("gmail_connected, gmail_email")
            .eq("id", current_user["id"])
            .single()
            .execute()
        )
        user = response.data or {}
        return {
            "connected": user.get("gmail_connected", False),
            "email": user.get("gmail_email"),
        }
    except Exception:
        return {"connected": False, "email": None}


@router.get("/fetch")
def fetch_alerts(
    max_results: int = Query(50, ge=1, le=200),
    current_user: dict = Depends(get_current_user),
):
    """Fetch bank alert emails from user's Gmail."""
    alerts = gmail_service.fetch_bank_alerts(
        user_id=current_user["id"],
        max_results=max_results,
    )
    return {
        "total": len(alerts),
        "alerts": alerts,
    }


@router.post("/disconnect")
def disconnect(current_user: dict = Depends(get_current_user)):
    """Disconnect Gmail from user's account."""
    gmail_service.disconnect(current_user["id"])
    return {"message": "Gmail disconnected"}

@router.post("/sync")
def sync_emails(
    max_results: int = Query(50, ge=1, le=200),
    current_user: dict = Depends(get_current_user),
):
    """Sync Gmail bank alerts into transactions."""
    from app.services.gmail_sync_service import gmail_sync_service

    return gmail_sync_service.sync_user_emails(
        user_id=current_user["id"],
        max_results=max_results,
    )