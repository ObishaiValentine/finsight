from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.router import api_router

app = FastAPI(
    title=settings.app_name,
    description="Intelligent Bank Alert Aggregation API",
    version=settings.app_version,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:3000",
        "http://localhost:5173",
        "https://finsight-ov-o4.vercel.app",
        "https://finsight-ecru-omega.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
def root():
    return {
        "message": f"{settings.app_name} API",
        "status": "running",
        "version": settings.app_version,
        "docs": "/docs",
    }

# Register API router (with /api prefix)
app.include_router(api_router)

allow_origins=[
    settings.frontend_url,
    "http://localhost:5173",
    "https://finsight-ov-o4.vercel.app",
    "https://finsight-ecru-omega.vercel.app",
],
allow_origin_regex=r"https://.*\.vercel\.app",