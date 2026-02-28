from sqlalchemy import Column, Integer, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class ExtractionResult(Base):
    __tablename__ = "extraction_results"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    skills = Column(Text)  # JSON array of skills
    experience = Column(Text)  # JSON array of experience
    education = Column(Text)  # JSON array of education
    responsibilities = Column(Text)  # JSON array of responsibilities
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="extraction_result")
