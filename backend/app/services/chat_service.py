import json
from typing import Optional

from openai import OpenAI

from app.core.config import settings

CHAT_SYSTEM = """Respond in the same language as the user's message (e.g. Chinese if they write in Chinese, English if in English).

You are a professional AI assistant with two main capabilities:

**1. Career assistant (when user has resume / job description):**
- Answer career-related questions based on uploaded resume and JD
- Explain resume-JD matching results
- Give advice on resume improvement, skill development, and career planning

**2. Business & market entry advisor (when user asks about company / market):**
- Market entry preparation (e.g. entering a new country or city: regulations, permits, logistics, partnerships)
- Industry-specific considerations (e.g. furniture: supply chain, retail vs B2B, local standards)
- Local context (e.g. city like Dongguan: labor, land, policies, key stakeholders)
- Suggest a clear preparation checklist and priorities; if you mention regulations or procedures, remind the user to verify with local authorities or professionals.

Rules:
- Base your suggestions only on what the user provides; do not fabricate facts or data.
- For career questions without resume/JD: guide them to upload. For business/market questions: answer from their description and general best practices, and state when they should consult local experts."""


def _get_client() -> Optional[OpenAI]:
    if settings.OPENROUTER_API_KEY:
        return OpenAI(
            base_url=settings.AI_BASE_URL,
            api_key=settings.OPENROUTER_API_KEY,
        )
    if settings.OPENAI_API_KEY:
        return OpenAI(api_key=settings.OPENAI_API_KEY)
    return None


def get_chat_response(
    user_message: str,
    history: list[dict],
    context: Optional[str] = None,
) -> str:
    """生成聊天回复，带上下文约束以控制幻觉"""
    client = _get_client()
    if not client:
        return "Please configure OPENROUTER_API_KEY or OPENAI_API_KEY to use the chat feature."

    messages = [{"role": "system", "content": CHAT_SYSTEM}]
    no_docs_placeholder = "User has not uploaded resume or job description yet."
    if context and context.strip() != no_docs_placeholder:
        messages.append({
            "role": "system",
            "content": f"User's relevant information (answer only based on this, do not fabricate):\n{context}",
        })
    # Only pass user messages to keep context clear and control response language
    for h in history[-10:]:
        if h["role"] == "user":
            messages.append({"role": "user", "content": h["content"]})
    messages.append({"role": "user", "content": user_message})

    try:
        response = client.chat.completions.create(
            model=settings.effective_ai_model,
            messages=messages,
            temperature=0.5,
            max_tokens=1024,
        )
        return response.choices[0].message.content or ""
    except Exception as e:
        return f"Sorry, an error occurred: {str(e)}"
