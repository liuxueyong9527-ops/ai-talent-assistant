import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.document import Document
from app.models.extraction_result import ExtractionResult
from app.models.chat_message import ChatMessage
from app.services.chat_service import get_chat_response

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


def _build_context(db: Session, user_id: int) -> str:
    docs = db.query(Document).filter(Document.user_id == user_id).order_by(Document.created_at.desc()).limit(5).all()
    parts = []
    for d in docs:
        er = db.query(ExtractionResult).filter(ExtractionResult.document_id == d.id).first()
        info = f"[{d.type}] {d.original_filename}"
        if er and er.skills:
            try:
                skills = json.loads(er.skills)
                info += f" skills: {', '.join(skills[:15])}"
            except Exception:
                pass
        if d.raw_text:
            info += f"\nSummary: {d.raw_text[:500]}..."
        parts.append(info)
    return "\n\n".join(parts) if parts else "User has not uploaded resume or job description yet."


@router.post("")
def chat(
    req: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    context = _build_context(db, current_user.id)
    history_msgs = db.query(ChatMessage).filter(ChatMessage.user_id == current_user.id).order_by(ChatMessage.created_at.desc()).limit(20).all()
    history = [{"role": m.role, "content": m.content} for m in reversed(history_msgs)]

    reply = get_chat_response(req.message, history, context)

    user_msg = ChatMessage(user_id=current_user.id, role="user", content=req.message)
    assistant_msg = ChatMessage(user_id=current_user.id, role="assistant", content=reply)
    db.add(user_msg)
    db.add(assistant_msg)
    db.commit()

    return {"role": "assistant", "content": reply}
