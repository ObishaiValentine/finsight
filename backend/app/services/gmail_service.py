"""Gmail integration service — OAuth flow + email fetching."""

import os
import base64
import re
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, List
from urllib.parse import urlencode

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
from fastapi import HTTPException, status

from app.core.config import settings
from app.core.supabase_client import supabase


# Gmail read-only scope
SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'openid',
    'https://www.googleapis.com/auth/userinfo.email',
]


class GmailService:
    """Handle Gmail OAuth and email fetching."""

    def get_auth_url(self, user_id: str) -> str:
        """
        Generate Google OAuth URL for user to grant Gmail access.
        Includes user_id in state so we can match the callback.
        """
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": settings.google_client_id,
                    "client_secret": settings.google_client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [settings.google_redirect_uri],
                }
            },
            scopes=SCOPES,
        )
        flow.redirect_uri = settings.google_redirect_uri

        auth_url, _ = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent',
            state=user_id,
        )

        return auth_url

    def handle_callback(self, code: str, user_id: str) -> Dict:
        """
        Exchange OAuth code for tokens, save to user record.
        Returns user's Gmail email.
        """
        try:
            flow = Flow.from_client_config(
                {
                    "web": {
                        "client_id": settings.google_client_id,
                        "client_secret": settings.google_client_secret,
                        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                        "token_uri": "https://oauth2.googleapis.com/token",
                        "redirect_uris": [settings.google_redirect_uri],
                    }
                },
                scopes=SCOPES,
            )
            flow.redirect_uri = settings.google_redirect_uri
            flow.fetch_token(code=code)

            credentials = flow.credentials

            # Get user's Gmail email address
            gmail_email = self._get_user_email(credentials)

            # Save tokens to user record
            expiry_iso = None
            if credentials.expiry:
                expiry_iso = credentials.expiry.isoformat()

            update_data = {
                "gmail_connected": True,
                "gmail_email": gmail_email,
                "gmail_access_token": credentials.token,
                "gmail_refresh_token": credentials.refresh_token,
                "gmail_token_expiry": expiry_iso,
            }

            supabase.table("users").update(update_data).eq("id", user_id).execute()

            return {
                "success": True,
                "gmail_email": gmail_email,
            }

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"OAuth callback failed: {str(e)}",
            )

    def _get_user_email(self, credentials: Credentials) -> str:
        """Get the authenticated user's email address from Google."""
        try:
            from googleapiclient.discovery import build as google_build
            oauth2_service = google_build('oauth2', 'v2', credentials=credentials)
            user_info = oauth2_service.userinfo().get().execute()
            return user_info.get('email', '')
        except Exception:
            return ''

    def _get_credentials(self, user_id: str) -> Optional[Credentials]:
        """Load and refresh credentials for a user."""
        try:
            response = (
                supabase.table("users")
                .select(
                    "gmail_access_token, gmail_refresh_token, gmail_token_expiry"
                )
                .eq("id", user_id)
                .single()
                .execute()
            )
            user = response.data

            if not user or not user.get("gmail_access_token"):
                return None

            credentials = Credentials(
                token=user["gmail_access_token"],
                refresh_token=user.get("gmail_refresh_token"),
                token_uri="https://oauth2.googleapis.com/token",
                client_id=settings.google_client_id,
                client_secret=settings.google_client_secret,
                scopes=SCOPES,
            )

            # Refresh if expired
            if credentials.expired and credentials.refresh_token:
                credentials.refresh(Request())
                # Save new token
                supabase.table("users").update({
                    "gmail_access_token": credentials.token,
                    "gmail_token_expiry": (
                        credentials.expiry.isoformat() if credentials.expiry else None
                    ),
                }).eq("id", user_id).execute()

            return credentials

        except Exception:
            return None

    def fetch_bank_alerts(self, user_id: str, max_results: int = 50) -> List[Dict]:
        """
        Fetch recent bank alert emails from Gmail.
        Filters by known bank sender domains / keywords.
        Returns list of {subject, sender, body, received_at}.
        """
        credentials = self._get_credentials(user_id)
        if not credentials:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Gmail not connected for this user",
            )

        try:
            service = build('gmail', 'v1', credentials=credentials)

            # Query: filter by bank alert senders/keywords
            query = (
                'from:(gtbank.com OR zenithbank.com OR accessbank.com OR '
                'ubagroup.com OR firstbanknigeria.com OR '
                'moniepoint.com OR carbon.ng OR kuda.com OR '
                'opay.com OR palmpay.com) '
                'OR subject:(alert OR transaction OR debit OR credit)'
            )

            results = service.users().messages().list(
                userId='me',
                q=query,
                maxResults=max_results,
            ).execute()

            messages = results.get('messages', [])
            alerts = []

            for msg in messages:
                full_msg = service.users().messages().get(
                    userId='me',
                    id=msg['id'],
                    format='full',
                ).execute()

                alert = self._extract_email_content(full_msg)
                if alert:
                    alerts.append(alert)

            return alerts

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch emails: {str(e)}",
            )

    def _extract_email_content(self, message: Dict) -> Optional[Dict]:
        """Extract subject, sender, and plain-text body from Gmail message."""
        try:
            headers = message['payload'].get('headers', [])
            subject = ''
            sender = ''
            received_at = ''

            for header in headers:
                name = header['name'].lower()
                if name == 'subject':
                    subject = header['value']
                elif name == 'from':
                    sender = header['value']
                elif name == 'date':
                    received_at = header['value']

            body = self._get_message_body(message['payload'])

            return {
                'gmail_id': message['id'],
                'subject': subject,
                'sender': sender,
                'received_at': received_at,
                'body': body,
            }
        except Exception:
            return None

    def _get_message_body(self, payload: Dict) -> str:
        """Recursively extract plain text body from Gmail payload."""
        try:
            if 'parts' in payload:
                for part in payload['parts']:
                    if part['mimeType'] == 'text/plain':
                        data = part['body'].get('data', '')
                        if data:
                            return base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
                    elif 'parts' in part:
                        # Recurse for nested parts
                        nested = self._get_message_body(part)
                        if nested:
                            return nested
            else:
                data = payload['body'].get('data', '')
                if data:
                    return base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
            return ''
        except Exception:
            return ''

    def disconnect(self, user_id: str) -> bool:
        """Remove Gmail tokens from user record."""
        try:
            supabase.table("users").update({
                "gmail_connected": False,
                "gmail_email": None,
                "gmail_access_token": None,
                "gmail_refresh_token": None,
                "gmail_token_expiry": None,
            }).eq("id", user_id).execute()
            return True
        except Exception:
            return False


# Singleton
gmail_service = GmailService()