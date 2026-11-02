from fastapi import APIRouter
from app.api import health, parser, auth, transactions, accounts, gmail, notifications
from app.core.config import settings

api_router = APIRouter(prefix=settings.api_prefix)

api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(parser.router)
api_router.include_router(transactions.router)
api_router.include_router(accounts.router)
api_router.include_router(gmail.router)
api_router.include_router(notifications.router)