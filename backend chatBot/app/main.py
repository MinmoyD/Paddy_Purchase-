from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .routers import health, chat, faq, documents
from .auth import create_token

app = FastAPI(title="Org Chatbot")

# --- DEVELOPMENT CORS FIX ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # allow all origins for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# --- END FIX ---

# Routers
app.include_router(health.router)
app.include_router(faq.router)
app.include_router(documents.router)
app.include_router(chat.router)

@app.get("/")
def root():
    return {"app": "Org Chatbot", "auth": "POST /token?user=...&role=..."}

@app.post("/token")
def token(user: str, role: str = "user"):
    return {
        "access_token": create_token(sub=user, role=role),
        "token_type": "bearer"
    }
