import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, SessionLocal
import models
from models import Staff
from routers import clients, intake_cases, staff, dashboard, insights


def _db_is_empty() -> bool:
    db = SessionLocal()
    try:
        return db.query(Staff).count() == 0
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables
    models.Base.metadata.create_all(bind=engine)
    # Auto-seed if the database is empty (fresh deploy or ephemeral filesystem reset)
    if _db_is_empty():
        from seed import seed
        seed()
    yield


app = FastAPI(
    title="ClinicFlow API",
    description="Operational intake workflow management for small clinics and therapy practices.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow localhost for dev + any Render/custom frontend via ALLOWED_ORIGINS env var
_raw = os.environ.get("ALLOWED_ORIGINS", "")
_extra = [o.strip() for o in _raw.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        *_extra,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(clients.router,      prefix="/api", tags=["Clients"])
app.include_router(intake_cases.router, prefix="/api", tags=["Intake Cases"])
app.include_router(staff.router,        prefix="/api", tags=["Staff"])
app.include_router(dashboard.router,    prefix="/api", tags=["Dashboard"])
app.include_router(insights.router,     prefix="/api", tags=["Insights"])


@app.get("/")
def root():
    return {"message": "ClinicFlow API", "version": "1.0.0", "status": "running"}
