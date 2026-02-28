import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.document import Document
from app.models.match_analysis import MatchAnalysis
from app.models.extraction_result import ExtractionResult

router = APIRouter()


@router.get("/stats")
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    docs = db.query(Document).filter(Document.user_id == current_user.id).all()
    resumes = [d for d in docs if d.type == "resume"]
    jds = [d for d in docs if d.type == "jd"]

    resume_ids = [r.id for r in resumes]
    analyses = db.query(MatchAnalysis).filter(MatchAnalysis.resume_id.in_(resume_ids)).order_by(MatchAnalysis.created_at.desc()).all() if resume_ids else []
    avg_match = sum(a.match_score or 0 for a in analyses) / len(analyses) if analyses else 0

    skill_counts: dict[str, int] = {}
    for d in docs:
        er = db.query(ExtractionResult).filter(ExtractionResult.document_id == d.id).first()
        if er and er.skills:
            try:
                skills = json.loads(er.skills)
                for s in skills:
                    if isinstance(s, str):
                        skill_counts[s] = skill_counts.get(s, 0) + 1
            except Exception:
                pass

    skill_distribution = [{"skill": k, "count": v} for k, v in skill_counts.items()]
    skill_distribution.sort(key=lambda x: -x["count"])

    recent = [
        {
            "id": a.id,
            "resume_id": a.resume_id,
            "jd_id": a.jd_id,
            "match_score": a.match_score,
            "created_at": a.created_at.isoformat() if a.created_at else "",
        }
        for a in analyses[:5]
    ]

    return {
        "total_documents": len(docs),
        "resumes_count": len(resumes),
        "jds_count": len(jds),
        "analyses_count": len(analyses),
        "avg_match_score": round(avg_match, 1),
        "skill_distribution": skill_distribution,
        "recent_analyses": recent,
    }
