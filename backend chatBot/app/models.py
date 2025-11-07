from pydantic import BaseModel, Field
from typing import Optional, List

class ChatRequest(BaseModel):
    message: str = Field(..., description="User message")
    top_k: int = 4
    use_faq_first: bool = True

class ChatResponse(BaseModel):
    reply: str
    sources: Optional[list[dict]] = None
    mode: str  # "FAQ" | "RAG" | "LLM"

class TokenPayload(BaseModel):
    sub: str
    role: str = "user"

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class DocAddRequest(BaseModel):
    title: str
    text: str

class FAQItem(BaseModel):
    q: str
    a: str

class FAQUpsertRequest(BaseModel):
    items: List[FAQItem]
