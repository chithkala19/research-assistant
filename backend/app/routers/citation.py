import logging
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session as DBSession

from app.database import get_db
from app.models.paper import Paper
from app.services.llm_client import call_gemini

logger = logging.getLogger(__name__)
router = APIRouter()

class CitationRequest(BaseModel):
    paper_id: str
    format: Optional[str] = "apa"

class CitationResponse(BaseModel):
    paper_id: str
    format: str
    citation: str

@router.post("/api/citations", response_model=CitationResponse)
async def generate_citation(
    request: CitationRequest,
    db: DBSession = Depends(get_db)
):
    paper = db.query(Paper).filter(Paper.id == request.paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found.")
    if not paper.text_content or not paper.text_content.strip():
        raise HTTPException(status_code=400, detail="Paper has no text content.")
    valid_formats = ["apa", "mla", "chicago", "bibtex", "ieee"]
    citation_format = request.format.lower() if request.format else "apa"
    if citation_format not in valid_formats:
        citation_format = "apa"
    format_descriptions = {
        "apa": "APA 7th Edition",
        "mla": "MLA 9th Edition",
        "chicago": "Chicago Manual of Style 17th Edition",
        "bibtex": "BibTeX format",
        "ieee": "IEEE citation format"
    }
    system_prompt = (
        f"You are a citation formatting expert. Generate a proper {format_descriptions[citation_format]} "
        f"citation for the given research paper. Extract the title, authors, year, journal/conference, "
        f"volume, issue, pages, and DOI from the paper text. If any information is missing, "
        f"indicate it with appropriate placeholders. Return ONLY the formatted citation string."
    )
    user_prompt = f"""Generate a {format_descriptions[citation_format]} citation for this paper.
Filename: {paper.original_name}

Paper content (first 3000 chars):
{paper.text_content[:3000]}"""
    try:
        citation = call_gemini(system_prompt, user_prompt)
        return CitationResponse(paper_id=request.paper_id, format=citation_format, citation=citation.strip())
    except Exception as e:
        logger.error(f"Citation generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Citation generation failed: {str(e)}")
