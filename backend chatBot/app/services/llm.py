import openai
from ..config import settings

openai.api_key = settings.OPENAI_API_KEY

def generate_answer(system_prompt: str, user_prompt: str) -> str:
    resp = openai.ChatCompletion.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.2,
    )
    return resp["choices"][0]["message"]["content"].strip()

def answer_with_context(question: str, contexts: list[dict]) -> str:
    context_text = "\n\n".join([f"[{i+1}] {c['chunk']}" for i, c in enumerate(contexts)])
    system = (
        "You are a concise, accurate organizational assistant. "
        "Use the provided CONTEXT strictly. If uncertain, say you don't know."
    )
    user = f"CONTEXT:\n{context_text}\n\nQUESTION:\n{question}\n\nFormat: brief answer then list sources as [1], [2] as needed."
    return generate_answer(system, user)
