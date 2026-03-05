import json
from typing import Optional

from openai import OpenAI

from app.core.config import settings

CHAT_SYSTEM = """You must always respond in English. Do not respond in Chinese or any other language.

You are a professional AI career assistant. You can:
1. Answer career-related questions based on the user's uploaded resume and job description
2. Explain the resume-JD matching results
3. Provide advice on resume improvement, skill development, and career planning

Only base your suggestions on the information the user provides; do not fabricate content. If the user has not provided a resume or JD, guide them to upload one."""


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
    if context:
        messages.append({
            "role": "system",
            "content": f"User's relevant information (answer only based on this, do not fabricate):\n{context}",
        })
    # Only pass user messages - assistant history may be in Chinese and overrides "respond in English"
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
