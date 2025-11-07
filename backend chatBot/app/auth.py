import time
import jwt  # <-- PyJWT
from fastapi import HTTPException, Header
from .config import settings
from .models import TokenPayload
from .utils.logger import get_logger

log = get_logger("auth")

def create_token(sub: str, role: str = "user", ttl_seconds: int = 3600) -> str:
    """
    Create a signed JWT with PyJWT.
    """
    now = int(time.time())
    payload = {
        "sub": sub,
        "role": role,
        "iat": now,
        "exp": now + ttl_seconds,
    }
    try:
        token = jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALG)
        # PyJWT>=2 returns a str; if bytes in older versions, decode:
        if isinstance(token, bytes):
            token = token.decode("utf-8")
        return token
    except Exception as e:
        log.error(f"Error creating JWT: {e}")
        raise HTTPException(status_code=500, detail="Token creation failed")

def verify_token(token: str) -> TokenPayload:
    """
    Verify and decode a JWT with PyJWT.
    """
    try:
        data = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALG])
        return TokenPayload(**data)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def admin_key_required(x_api_key: str = Header(None)):
    if not settings.ADMIN_API_KEYS or x_api_key not in settings.ADMIN_API_KEYS:
        raise HTTPException(status_code=401, detail="Invalid or missing admin API key")
