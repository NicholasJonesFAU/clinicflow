import os
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from jose import jwt

router = APIRouter()

SECRET_KEY   = os.environ.get("SECRET_KEY",      "clinicflow-dev-secret-change-in-production")
ALGORITHM    = "HS256"
EXPIRE_HOURS = int(os.environ.get("TOKEN_EXPIRE_HOURS", "24"))

ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "clinicflow")


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/auth/login", response_model=TokenResponse)
def login(creds: LoginRequest):
    if creds.username != ADMIN_USERNAME or creds.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    expire = datetime.now(timezone.utc) + timedelta(hours=EXPIRE_HOURS)
    token  = jwt.encode({"sub": creds.username, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)
    return TokenResponse(access_token=token)
