from fastapi import APIRouter, Depends
from ..models import DocAddRequest
from ..auth import admin_key_required

router = APIRouter(prefix="/docs", tags=["documents"])

@router.post("/add", dependencies=[Depends(admin_key_required)])
def add_doc(doc: DocAddRequest):
    # Simple endpoint to stash new text docs into data/docs as .txt files
    import os, time
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "docs"))
    os.makedirs(root, exist_ok=True)
    fname = f"{int(time.time())}_{doc.title.replace(' ','_')}.txt"
    with open(os.path.join(root, fname), "w", encoding="utf-8") as f:
        f.write(doc.text)
    return {"saved": fname, "message": "Run /scripts/ingest.py to reindex."}
