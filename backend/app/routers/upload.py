import uuid
import os
import shutil
import logging
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Query
from sqlalchemy.orm import Session as DBSession
from pydantic import BaseModel
from typing import Optional, List

from app.database import get_db
from app.models.paper import Paper
from app.config import settings
from app.services.pdf_extractor import extract_text
from app.services.rag_engine import index_document

logger = logging.getLogger(__name__)
router = APIRouter()

class PaperResponse(BaseModel):
    id: str
    filename: str
    original_name: str
    upload_date: str
    page_count: int
    status: str
    file_size: int
    session_id: Optional[str] = None
    class Config:
        from_attributes = True

class PaperDetailResponse(PaperResponse):
    text_content: Optional[str] = None

class PaperListResponse(BaseModel):
    papers: List[PaperResponse]
    total: int

class DeleteResponse(BaseModel):
    message: str
    paper_id: str

@router.post("/api/upload", response_model=PaperResponse)
async def upload_paper(
    file: UploadFile = File(...),
    session_id: Optional[str] = Query(None),
    db: DBSession = Depends(get_db)
):
    if not file.filename or not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    paper_id = str(uuid.uuid4())
    safe_filename = f"{paper_id}.pdf"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)
    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        file_size = len(content)
        extraction_result = extract_text(file_path)
        text_content = extraction_result.get("text", "")
        page_count = extraction_result.get("pages", 0)
        status = "ready" if text_content.strip() else "empty"
        paper = Paper(
            id=paper_id, filename=safe_filename, original_name=file.filename,
            upload_date=datetime.utcnow(), page_count=page_count, status=status,
            text_content=text_content, file_size=file_size, session_id=session_id
        )
        db.add(paper)
        db.commit()
        db.refresh(paper)
        if text_content.strip():
            try:
                index_document(paper_id, text_content)
            except Exception as idx_err:
                logger.error(f"Indexing failed for {paper_id}: {idx_err}")
                paper.status = "index_error"
                db.commit()
        return PaperResponse(
            id=paper.id, filename=paper.filename, original_name=paper.original_name,
            upload_date=paper.upload_date.isoformat(), page_count=paper.page_count,
            status=paper.status, file_size=paper.file_size, session_id=paper.session_id
        )
    except HTTPException:
        raise
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        logger.error(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.get("/api/papers", response_model=PaperListResponse)
async def list_papers(
    session_id: Optional[str] = Query(None),
    db: DBSession = Depends(get_db)
):
    query = db.query(Paper)
    if session_id:
        query = query.filter(Paper.session_id == session_id)
    papers = query.order_by(Paper.upload_date.desc()).all()
    paper_list = [
        PaperResponse(
            id=p.id, filename=p.filename, original_name=p.original_name,
            upload_date=p.upload_date.isoformat() if p.upload_date else "",
            page_count=p.page_count or 0, status=p.status or "unknown",
            file_size=p.file_size or 0, session_id=p.session_id
        ) for p in papers
    ]
    return PaperListResponse(papers=paper_list, total=len(paper_list))

@router.get("/api/papers/{paper_id}", response_model=PaperDetailResponse)
async def get_paper(paper_id: str, db: DBSession = Depends(get_db)):
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found.")
    return PaperDetailResponse(
        id=paper.id, filename=paper.filename, original_name=paper.original_name,
        upload_date=paper.upload_date.isoformat() if paper.upload_date else "",
        page_count=paper.page_count or 0, status=paper.status or "unknown",
        file_size=paper.file_size or 0, session_id=paper.session_id,
        text_content=paper.text_content
    )

@router.delete("/api/papers/{paper_id}", response_model=DeleteResponse)
async def delete_paper(paper_id: str, db: DBSession = Depends(get_db)):
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found.")
    file_path = os.path.join(settings.UPLOAD_DIR, paper.filename)
    if os.path.exists(file_path):
        os.remove(file_path)
    from app.services.vector_store import delete_collection
    try:
        delete_collection(paper_id)
    except Exception as e:
        logger.error(f"Error deleting vector collection for {paper_id}: {e}")
    db.delete(paper)
    db.commit()
    return DeleteResponse(message="Paper deleted successfully.", paper_id=paper_id)
