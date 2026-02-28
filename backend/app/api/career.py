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
from app.services.ai_service import get_career_advice, parse_resume_or_jd

router = APIRouter()


class CareerAdviceRequest(BaseModel):
    document_id: int
    target_role: Optional[str] = None


@router.post("/advice")
def get_career_advice_api(
    req: CareerAdviceRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = db.query(Document).filter(Document.id == req.document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    resume_ext = {}
    er = db.query(ExtractionResult).filter(ExtractionResult.document_id == doc.id).first()
    if er:
        resume_ext = {
            "skills": json.loads(er.skills) if er.skills else [],
            "experience": json.loads(er.experience) if er.experience else [],
            "education": json.loads(er.education) if er.education else [],
            "responsibilities": json.loads(er.responsibilities) if er.responsibilities else [],
        }
    if not resume_ext and doc.raw_text:
        resume_ext = parse_resume_or_jd(doc.raw_text, doc.type)

    return get_career_advice(resume_ext, req.target_role or "")
