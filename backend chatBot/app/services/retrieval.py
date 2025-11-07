import os, json, numpy as np
from typing import List, Dict
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from ..config import settings
from ..utils.logger import get_logger

log = get_logger("retrieval")

ROOT = os.path.dirname(os.path.dirname(__file__))
VEC_DIR = os.path.abspath(os.path.join(ROOT, "..", "storage"))
DOC_DIR = os.path.abspath(os.path.join(ROOT, "..", "data", "docs"))
VEC_PATH = os.path.join(VEC_DIR, "vector_index.npy")
META_PATH = os.path.join(VEC_DIR, "vector_meta.json")

_model = None

def get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer(settings.EMBEDDING_MODEL)
        log.info(f"Loaded embedding model: {settings.EMBEDDING_MODEL}")
    return _model

def embed_texts(texts: List[str]) -> np.ndarray:
    model = get_model()
    emb = model.encode(texts, normalize_embeddings=True)
    return np.array(emb, dtype=np.float32)

def search(query: str, top_k: int = 4) -> List[Dict]:
    if not (os.path.exists(VEC_PATH) and os.path.exists(META_PATH)):
        return []
    X = np.load(VEC_PATH)
    with open(META_PATH, "r", encoding="utf-8") as f:
        meta = json.load(f)
    qv = embed_texts([query])
    sims = cosine_similarity(qv, X)[0]
    idxs = sims.argsort()[-top_k:][::-1]
    results = []
    for i in idxs:
        m = meta[i]
        results.append({
            "title": m["title"],
            "chunk": m["chunk"],
            "score": float(sims[i]),
            "path": m.get("path")
        })
    return results
