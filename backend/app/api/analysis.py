import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.document import Document
from app.models.match_analysis import MatchAnalysis
from app.models.extraction_result import ExtractionResult
from app.services.ai_service import match_resume_to_jd

router = APIRouter()


class MatchRequest(BaseModel):
    resume_id: int
    jd_id: int


@router.post("/match")
def create_match_analysis(
    req: MatchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = db.query(Document).filter(Document.id == req.resume_id, Document.user_id == current_user.id).first()
    jd = db.query(Document).filter(Document.id == req.jd_id, Document.user_id == current_user.id).first()
    if not resume or resume.type != "resume":
        raise HTTPException(status_code=404, detail="Resume not found")
    if not jd or jd.type != "jd":
        raise HTTPException(status_code=404, detail="Job description not found")

    resume_er = db.query(ExtractionResult).filter(ExtractionResult.document_id == resume.id).first()
    jd_er = db.query(ExtractionResult).filter(ExtractionResult.document_id == jd.id).first()

    resume_ext = {}
    jd_ext = {}
    if resume_er:
        resume_ext = {
            "skills": json.loads(resume_er.skills) if resume_er.skills else [],
            "experience": json.loads(resume_er.experience) if resume_er.experience else [],
            "education": json.loads(resume_er.education) if resume_er.education else [],
            "responsibilities": json.loads(resume_er.responsibilities) if resume_er.responsibilities else [],
        }
    if jd_er:
        jd_ext = {
            "skills": json.loads(jd_er.skills) if jd_er.skills else [],
            "experience": json.loads(jd_er.experience) if jd_er.experience else [],
            "education": json.loads(jd_er.education) if jd_er.education else [],
            "responsibilities": json.loads(jd_er.responsibilities) if jd_er.responsibilities else [],
        }

    if not resume_ext.get("skills") and not resume.raw_text:
        raise HTTPException(status_code=400, detail="Resume has no extraction result, please re-upload")
    if not jd_ext.get("skills") and not jd.raw_text:
        raise HTTPException(status_code=400, detail="JD has no extraction result, please re-upload")

    if not resume_ext and resume.raw_text:
        from app.services.ai_service import parse_resume_or_jd
        resume_ext = parse_resume_or_jd(resume.raw_text or "", "resume")
        if not resume_er:
            resume_er = ExtractionResult(
                document_id=resume.id,
                skills=json.dumps(resume_ext.get("skills", []), ensure_ascii=False),
                experience=json.dumps(resume_ext.get("experience", []), ensure_ascii=False),
                education=json.dumps(resume_ext.get("education", []), ensure_ascii=False),
                responsibilities=json.dumps(resume_ext.get("responsibilities", []), ensure_ascii=False),
            )
            db.add(resume_er)
            db.commit()
    if not jd_ext and jd.raw_text:
        from app.services.ai_service import parse_resume_or_jd
        jd_ext = parse_resume_or_jd(jd.raw_text or "", "jd")
        if not jd_er:
            jd_er = ExtractionResult(
                document_id=jd.id,
                skills=json.dumps(jd_ext.get("skills", []), ensure_ascii=False),
                experience=json.dumps(jd_ext.get("experience", []), ensure_ascii=False),
                education=json.dumps(jd_ext.get("education", []), ensure_ascii=False),
                responsibilities=json.dumps(jd_ext.get("responsibilities", []), ensure_ascii=False),
            )
            db.add(jd_er)
            db.commit()

    result = match_resume_to_jd(resume_ext, jd_ext)

    analysis = MatchAnalysis(
        resume_id=req.resume_id,
        jd_id=req.jd_id,
        match_score=float(result["match_percentage"]),
        matched_skills=json.dumps(result.get("matched_skills", []), ensure_ascii=False),
        skill_gaps=json.dumps(result.get("skill_gaps", []), ensure_ascii=False),
        improvement_suggestions=json.dumps(result.get("improvement_suggestions", []), ensure_ascii=False),
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    return {"id": analysis.id, "match_score": result["match_percentage"]}


@router.get("/{analysis_id}")
def get_analysis(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    analysis = db.query(MatchAnalysis).filter(MatchAnalysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    resume = db.query(Document).filter(Document.id == analysis.resume_id).first()
    if not resume or resume.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return {
        "id": analysis.id,
        "resume_id": analysis.resume_id,
        "jd_id": analysis.jd_id,
        "match_score": analysis.match_score,
        "matched_skills": json.loads(analysis.matched_skills) if analysis.matched_skills else [],
        "skill_gaps": json.loads(analysis.skill_gaps) if analysis.skill_gaps else [],
        "improvement_suggestions": json.loads(analysis.improvement_suggestions) if analysis.improvement_suggestions else [],
        "created_at": analysis.created_at.isoformat() if analysis.created_at else "",
    }
