from fastapi import APIRouter

from app.api import health, parser, auth, transactions, accounts
from app.core.config import settings

api_router = APIRouter(prefix=settings.api_prefix)

# Register sub-routers
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(parser.router)
api_router.include_router(transactions.router)
api_router.include_router(accounts.router)