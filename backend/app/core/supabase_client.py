"""
Supabase client initialization.
"""

from supabase import create_client, Client
from app.core.config import settings


def get_supabase_client() -> Client:
    """
    Create Supabase client with service role key.
    Use this for admin operations (backend only).
    """
    if not settings.supabase_url or not settings.supabase_service_key:
        raise ValueError(
            "Supabase credentials not configured. "
            "Check SUPABASE_URL and SUPABASE_SERVICE_KEY in .env"
        )

    return create_client(settings.supabase_url, settings.supabase_service_key)


def get_supabase_anon_client() -> Client:
    """
    Create Supabase client with anon key.
    Use this for user-scoped operations.
    """
    if not settings.supabase_url or not settings.supabase_anon_key:
        raise ValueError(
            "Supabase credentials not configured. "
            "Check SUPABASE_URL and SUPABASE_ANON_KEY in .env"
        )

    return create_client(settings.supabase_url, settings.supabase_anon_key)


# Singleton instance for admin operations
supabase: Client = get_supabase_client()

import time
from typing import Callable, Any


def safe_query(query_fn: Callable[[], Any], retries: int = 3) -> Any:
    """
    Execute a Supabase query with retry on transient socket errors (Windows).
    """
    last_error = None
    for attempt in range(retries):
        try:
            return query_fn()
        except Exception as e:
            err_str = str(e)
            # Retry on Windows socket errors
            if "WinError 10035" in err_str or "non-blocking socket" in err_str:
                last_error = e
                time.sleep(0.1 * (attempt + 1))
                continue
            # Other errors: fail immediately
            raise
    raise last_error