"""
Supabase client initialization.
"""

import httpx
from supabase import create_client, Client
from supabase.lib.client_options import ClientOptions
from app.core.config import settings


def get_supabase_client() -> Client:
    """
    Create Supabase client with service role key.
    Force HTTP/1.1 to avoid HTTP/2 pseudo-header trailer errors.
    """
    if not settings.supabase_url or not settings.supabase_service_key:
        raise ValueError(
            "Supabase credentials not configured. "
            "Check SUPABASE_URL and SUPABASE_SERVICE_KEY in .env"
        )

    # Force HTTP/1.1 to prevent the "pseudo-header in trailer" error
    # that occurs with HTTP/2 on some networks/proxies.
    http_client = httpx.Client(http2=False)

    # Use ClientOptions to pass the custom httpx client
    options = ClientOptions(httpx_client=http_client)

    return create_client(
        settings.supabase_url,
        settings.supabase_service_key,
        options=options
    )


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

    http_client = httpx.Client(http2=False)
    options = ClientOptions(httpx_client=http_client)

    return create_client(
        settings.supabase_url,
        settings.supabase_anon_key,
        options=options
    )


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