from fastapi import Depends, Header, HTTPException
from .auth import verify_token

async def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = authorization.split(" ")[1]
    return verify_token(token)
