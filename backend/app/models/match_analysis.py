from sqlalchemy import Column, Integer, ForeignKey, Float, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class MatchAnalysis(Base):
    __tablename__ = "match_analyses"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    jd_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    match_score = Column(Float)
    matched_skills = Column(Text)  # JSON array
    skill_gaps = Column(Text)  # JSON array
    improvement_suggestions = Column(Text)  # JSON array
    created_at = Column(DateTime, default=datetime.utcnow)

    resume = relationship("Document", foreign_keys=[resume_id], back_populates="resume_analyses")
    jd = relationship("Document", foreign_keys=[jd_id], back_populates="jd_analyses")
