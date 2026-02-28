from typing import Optional, List
from pydantic import BaseModel


class DocumentUploadResponse(BaseModel):
    id: int
    type: str
    original_filename: str
    created_at: str

    class Config:
        from_attributes = True


class ExtractionResultSchema(BaseModel):
    skills: Optional[List[str]] = []
    experience: Optional[List[dict]] = []
    education: Optional[List[dict]] = []
    responsibilities: Optional[List[str]] = []


class DocumentDetailResponse(BaseModel):
    id: int
    type: str
    original_filename: str
    raw_text: Optional[str] = None
    extraction: Optional[ExtractionResultSchema] = None
    created_at: str

    class Config:
        from_attributes = True
