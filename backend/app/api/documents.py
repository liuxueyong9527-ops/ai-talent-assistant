from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.document import Document
from app.models.extraction_result import ExtractionResult
from app.models.match_analysis import MatchAnalysis
from app.schemas.document import DocumentUploadResponse, DocumentDetailResponse, ExtractionResultSchema
from app.services.file_service import save_upload
from app.services.ai_service import parse_resume_or_jd
import json

router = APIRouter()


@router.post("/upload", response_model=DocumentUploadResponse)
def upload_document(
    file: UploadFile = File(...),
    doc_type: str = Form("resume"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if doc_type not in ("resume", "jd"):
        raise HTTPException(status_code=400, detail="doc_type must be 'resume' or 'jd'")

    doc, raw_text = save_upload(file, current_user.id, doc_type)
    db.add(doc)
    db.commit()
    db.refresh(doc)

    extraction = parse_resume_or_jd(raw_text, doc_type)
    er = ExtractionResult(
        document_id=doc.id,
        skills=json.dumps(extraction.get("skills", []), ensure_ascii=False),
        experience=json.dumps(extraction.get("experience", []), ensure_ascii=False),
        education=json.dumps(extraction.get("education", []), ensure_ascii=False),
        responsibilities=json.dumps(extraction.get("responsibilities", []), ensure_ascii=False),
    )
    db.add(er)
    db.commit()

    return DocumentUploadResponse(
        id=doc.id,
        type=doc.type,
        original_filename=doc.original_filename,
        created_at=doc.created_at.isoformat() if doc.created_at else "",
    )


@router.get("/", response_model=list[DocumentUploadResponse])
def list_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    docs = db.query(Document).filter(Document.user_id == current_user.id).order_by(Document.created_at.desc()).all()
    return [
        DocumentUploadResponse(
            id=d.id,
            type=d.type,
            original_filename=d.original_filename,
            created_at=d.created_at.isoformat() if d.created_at else "",
        )
        for d in docs
    ]


@router.get("/{doc_id}", response_model=DocumentDetailResponse)
def get_document(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    extraction = None
    if doc.extraction_result:
        er = doc.extraction_result

        def _parse(v, default=None):
            if default is None:
                default = []
            if not v:
                return default
            try:
                out = json.loads(v)
                return out if isinstance(out, list) else default
            except Exception:
                return default

        extraction = ExtractionResultSchema(
            skills=_parse(er.skills),
            experience=_parse(er.experience),
            education=_parse(er.education),
            responsibilities=_parse(er.responsibilities),
        )

    return DocumentDetailResponse(
        id=doc.id,
        type=doc.type,
        original_filename=doc.original_filename,
        raw_text=doc.raw_text,
        extraction=extraction,
        created_at=doc.created_at.isoformat() if doc.created_at else "",
    )


@router.delete("/{doc_id}")
def delete_document(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # 删除关联的匹配分析（作为 resume 或 jd 的记录）
    db.query(MatchAnalysis).filter(
        (MatchAnalysis.resume_id == doc_id) | (MatchAnalysis.jd_id == doc_id)
    ).delete(synchronize_session=False)

    # 删除提取结果
    db.query(ExtractionResult).filter(ExtractionResult.document_id == doc_id).delete()

    # 删除物理文件
    if doc.file_path:
        fp = Path(doc.file_path)
        if fp.is_file():
            try:
                fp.unlink()
            except OSError:
                pass

    db.delete(doc)
    db.commit()
    return {"ok": True}
