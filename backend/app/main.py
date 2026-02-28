from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import auth, users, documents, analysis, career, dashboard, chat
from app.core.database import engine, Base
from app.core.config import settings
from app.models import User, Document, ExtractionResult, MatchAnalysis, ChatMessage  # noqa: F401

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Talent Assistant API",
    description="AI-powered talent assistant platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["analysis"])
app.include_router(career.router, prefix="/api/career", tags=["career"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])


@app.exception_handler(Exception)
def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc) if "test" not in str(exc).lower() else "Internal server error"},
    )


@app.on_event("startup")
def startup():
    from pathlib import Path
    Path("data").mkdir(exist_ok=True)
    (Path("data") / "uploads").mkdir(exist_ok=True)


@app.get("/health")
def health_check():
    return {"status": "ok"}
