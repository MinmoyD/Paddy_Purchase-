from fastapi import APIRouter, Depends
from ..services.faq_service import answer_from_faq, upsert_faqs, load_faqs
from ..models import FAQUpsertRequest
from ..auth import admin_key_required

router = APIRouter(prefix="/faq", tags=["faq"])

@router.get("/ask")
def ask(q: str):
    return {"answer": answer_from_faq(q)}

@router.get("")
def list_faqs():
    return load_faqs()

@router.post("/upsert", dependencies=[Depends(admin_key_required)])
def upsert(req: FAQUpsertRequest):
    total = upsert_faqs([x.model_dump() for x in req.items])
    return {"updated_count": total}
