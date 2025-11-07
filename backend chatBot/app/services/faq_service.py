import yaml, json, os, re
from typing import Optional
from ..utils.logger import get_logger

log = get_logger("faq")
FAQ_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "data", "faqs.yaml")
FAQ_INDEX_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "storage", "faq_index.json")

def _normalize(s: str) -> str:
    return re.sub(r"\s+", " ", s.strip().lower())

def load_faqs():
    if not os.path.exists(FAQ_PATH):
        return []
    with open(FAQ_PATH, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f) or []
    return data

def build_index():
    faqs = load_faqs()
    index = [{"q": _normalize(x["q"]), "a": x["a"]} for x in faqs]
    os.makedirs(os.path.dirname(FAQ_INDEX_PATH), exist_ok=True)
    with open(FAQ_INDEX_PATH, "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False, indent=2)
    log.info(f"FAQ index built with {len(index)} items.")

def answer_from_faq(user_msg: str) -> Optional[str]:
    try:
        if not os.path.exists(FAQ_INDEX_PATH):
            build_index()
        with open(FAQ_INDEX_PATH, "r", encoding="utf-8") as f:
            index = json.load(f)
        nmsg = _normalize(user_msg)
        for item in index:
            # simple contains or exact-ish match
            if nmsg in item["q"] or item["q"] in nmsg:
                return item["a"]
        return None
    except Exception as e:
        log.error(f"FAQ error: {e}")
        return None

def upsert_faqs(items: list[dict]):
    existing = load_faqs()
    existing_map = {x["q"]: x for x in existing}
    for it in items:
        existing_map[it["q"]] = {"q": it["q"], "a": it["a"]}
    updated = list(existing_map.values())
    with open(FAQ_PATH, "w", encoding="utf-8") as f:
        yaml.safe_dump(updated, f, allow_unicode=True, sort_keys=False)
    build_index()
    return len(updated)

