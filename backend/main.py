import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from database import engine, SessionLocal
import models
from models import Staff
from deps import require_auth
from routers import auth, clients, intake_cases, staff, dashboard, insights


def _db_is_empty() -> bool:
    db = SessionLocal()
    try:
        return db.query(Staff).count() == 0
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    models.Base.metadata.create_all(bind=engine)
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

_raw   = os.environ.get("ALLOWED_ORIGINS", "")
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

# Public — no auth required
app.include_router(auth.router, prefix="/api", tags=["Auth"])

# Protected — all routes require a valid JWT
_protected = {"dependencies": [Depends(require_auth)]}
app.include_router(clients.router,      prefix="/api", tags=["Clients"],      **_protected)
app.include_router(intake_cases.router, prefix="/api", tags=["Intake Cases"], **_protected)
app.include_router(staff.router,        prefix="/api", tags=["Staff"],        **_protected)
app.include_router(dashboard.router,    prefix="/api", tags=["Dashboard"],    **_protected)
app.include_router(insights.router,     prefix="/api", tags=["Insights"],     **_protected)


@app.get("/")
def root():
    return {"message": "ClinicFlow API", "version": "1.0.0", "status": "running"}
