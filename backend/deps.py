import os
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

SECRET_KEY = os.environ.get("SECRET_KEY", "clinicflow-dev-secret-change-in-production")
ALGORITHM = "HS256"

bearer = HTTPBearer()


def require_auth(credentials: HTTPAuthorizationCredentials = Depends(bearer)):
    try:
        jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
