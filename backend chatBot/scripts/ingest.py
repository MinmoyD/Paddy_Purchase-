import os, json, numpy as np
from pdfminer.high_level import extract_text
from pathlib import Path
from sentence_transformers import SentenceTransformer
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "data" / "docs"
STO = ROOT / "storage"
STO.mkdir(parents=True, exist_ok=True)

EMB_MODEL = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
model = SentenceTransformer(EMB_MODEL)

def read_file(p: Path) -> str:
    if p.suffix.lower() == ".pdf":
        return extract_text(str(p))
    return p.read_text(encoding="utf-8", errors="ignore")

def chunk_text(text: str, size=800, overlap=120):
    text = " ".join(text.split())
    chunks = []
    i = 0
    while i < len(text):
        chunk = text[i:i+size]
        chunks.append(chunk)
        i += size - overlap
    return chunks

def clean_chunk(s: str) -> str:
    # optional light cleaning
    return " ".join([w for w in s.split() if w.lower() not in ENGLISH_STOP_WORDS])

def main():
    metas = []
    all_chunks = []
    for p in DOCS.glob("**/*"):
        if not p.is_file(): 
            continue
        if p.suffix.lower() not in [".txt", ".md", ".pdf"]:
            continue
        text = read_file(p)
        if not text.strip():
            continue
        chunks = chunk_text(text)
        for ch in chunks:
            metas.append({"title": p.stem, "path": str(p), "chunk": ch})
            all_chunks.append(clean_chunk(ch))
    if not all_chunks:
        print("No documents found.")
        return
    X = model.encode(all_chunks, normalize_embeddings=True)
    np.save(STO / "vector_index.npy", np.array(X, dtype="float32"))
    with open(STO / "vector_meta.json", "w", encoding="utf-8") as f:
        json.dump(metas, f, ensure_ascii=False, indent=2)
    print(f"Indexed {len(all_chunks)} chunks from {len(set(m['title'] for m in metas))} docs.")

if __name__ == "__main__":
    main()
