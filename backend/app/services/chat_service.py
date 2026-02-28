import json
from typing import Optional

from openai import OpenAI

from app.core.config import settings

CHAT_SYSTEM = """你是一个专业的 AI 职业助手。你可以：
1. 基于用户上传的简历和职位描述回答职业相关问题
2. 解释简历与 JD 的匹配结果
3. 提供简历改进、技能提升、职业规划等建议

请仅基于用户提供的信息给出建议，不要虚构内容。如果用户未提供简历或 JD，可以引导他们上传。"""


def _get_client() -> Optional[OpenAI]:
    if not settings.OPENAI_API_KEY:
        return None
    return OpenAI(api_key=settings.OPENAI_API_KEY)


def get_chat_response(
    user_message: str,
    history: list[dict],
    context: Optional[str] = None,
) -> str:
    """生成聊天回复，带上下文约束以控制幻觉"""
    client = _get_client()
    if not client:
        return "请配置 OPENAI_API_KEY 以使用聊天功能。"

    messages = [{"role": "system", "content": CHAT_SYSTEM}]
    if context:
        messages.append({
            "role": "system",
            "content": f"用户的相关资料（仅基于此回答，勿编造）：\n{context}",
        })
    for h in history[-10:]:  # 最近 10 轮
        messages.append({"role": h["role"], "content": h["content"]})
    messages.append({"role": "user", "content": user_message})

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.5,
            max_tokens=1024,
        )
        return response.choices[0].message.content or ""
    except Exception as e:
        return f"抱歉，发生错误：{str(e)}"
