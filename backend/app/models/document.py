from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.core.database import Base


class DocumentType(str, enum.Enum):
    resume = "resume"
    jd = "jd"


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String(20), nullable=False)  # resume or jd
    file_path = Column(String(512), nullable=False)
    original_filename = Column(String(255), nullable=False)
    raw_text = Column(String)  # Extracted text before AI processing
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="documents")
    extraction_result = relationship("ExtractionResult", back_populates="document", uselist=False)
    resume_analyses = relationship("MatchAnalysis", foreign_keys="MatchAnalysis.resume_id", back_populates="resume")
    jd_analyses = relationship("MatchAnalysis", foreign_keys="MatchAnalysis.jd_id", back_populates="jd")
