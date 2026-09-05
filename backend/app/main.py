import os
import logging
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import create_tables
from app.routers import upload, chat, summary, literature, domain, citation, realtime, visualization, consistency

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Research Assistant API...")
    create_tables()
    logger.info("Database tables created.")
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    logger.info(f"Upload directory ready: {settings.UPLOAD_DIR}")
    os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)
    logger.info(f"ChromaDB directory ready: {settings.CHROMA_PERSIST_DIR}")
    if settings.GEMINI_STUB_MODE:
        logger.warning("Running in STUB MODE - Gemini API calls will return placeholder responses.")
    else:
        logger.info("Gemini API configured and ready.")
    yield
    logger.info("Shutting down Research Assistant API...")

app = FastAPI(
    title="AI Research Assistant API",
    description="An AI-powered research assistant for analyzing academic papers.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_ORIGIN,
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, tags=["Upload & Papers"])
app.include_router(chat.router, tags=["Chat"])
app.include_router(summary.router, tags=["Summary"])
app.include_router(literature.router, tags=["Literature Survey"])
app.include_router(domain.router, tags=["Domain Identification"])
app.include_router(citation.router, tags=["Citations"])
app.include_router(realtime.router, tags=["Realtime Search"])
app.include_router(visualization.router, tags=["Visualization"])
app.include_router(consistency.router, tags=["Consistency Check"])

@app.get("/", tags=["Health"])
async def root():
    return {
        "message": "AI Research Assistant API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
    }

@app.get("/api/status", tags=["Health"])
async def api_status():
    return {
        "status": "running",
        "timestamp": datetime.utcnow().isoformat(),
        "gemini_model": settings.GEMINI_MODEL,
        "database": settings.DATABASE_URL,
        "upload_dir": settings.UPLOAD_DIR,
        "chroma_dir": settings.CHROMA_PERSIST_DIR,
    }
