from fastapi import APIRouter, Depends
from ..deps import get_current_user
from ..models import ChatRequest, ChatResponse
from ..services.faq_service import answer_from_faq
from ..services.retrieval import search
from ..services.llm import answer_with_context, generate_answer

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("", response_model=ChatResponse)
def chat(req: ChatRequest, user=Depends(get_current_user)):
    # 1) FAQ pass
    if req.use_faq_first:
        ans = answer_from_faq(req.message)
        if ans:
            return ChatResponse(reply=ans, sources=[], mode="FAQ")

    # 2) RAG
    ctx = search(req.message, top_k=req.top_k)
    if ctx:
        reply = answer_with_context(req.message, ctx)
        # shape sources
        sources = [{"title": c["title"], "score": round(c["score"], 3), "path": c.get("path")} for c in ctx]
        return ChatResponse(reply=reply, sources=sources, mode="RAG")

    # 3) Fallback LLM
    reply = generate_answer(
        "You are a helpful organizational assistant. If you don't know, say so.",
        req.message
    )
    return ChatResponse(reply=reply, sources=[], mode="LLM")
