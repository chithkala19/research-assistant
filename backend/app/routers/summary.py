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

class SummaryRequest(BaseModel):
    paper_id: str
    summary_type: Optional[str] = "abstract"

class SummaryResponse(BaseModel):
    paper_id: str
    summary_type: str
    summary: str

@router.post("/api/summary", response_model=SummaryResponse)
async def generate_summary(
    request: SummaryRequest,
    db: DBSession = Depends(get_db)
):
    paper = db.query(Paper).filter(Paper.id == request.paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found.")
    if not paper.text_content or not paper.text_content.strip():
        raise HTTPException(status_code=400, detail="Paper has no text content.")
    summary_prompts = {
        "abstract": {
            "system": "You are an expert academic summarizer. Create a concise abstract-style summary of the given research paper.",
            "user": f"Please provide a concise abstract-style summary (150-250 words) of the following research paper:\n\n{paper.text_content[:8000]}"
        },
        "detailed": {
            "system": "You are an expert academic summarizer. Create a comprehensive, detailed summary of the given research paper covering all key sections.",
            "user": f"Please provide a detailed summary of the following research paper. Cover the introduction, methodology, key findings, results, and conclusions:\n\n{paper.text_content[:12000]}"
        },
        "bullet_points": {
            "system": "You are an expert academic summarizer. Create a bullet-point summary highlighting the key takeaways from the given research paper.",
            "user": f"Please provide a bullet-point summary of the key takeaways from the following research paper. Use clear, concise bullet points organized by section:\n\n{paper.text_content[:10000]}"
        },
        "eli5": {
            "system": "You are a science communicator who explains complex research in simple terms that anyone can understand.",
            "user": f"Please explain this research paper in simple terms that a 5-year-old (or non-expert) could understand. Avoid jargon and use analogies where helpful:\n\n{paper.text_content[:8000]}"
        }
    }
    summary_type = request.summary_type if request.summary_type in summary_prompts else "abstract"
    prompts = summary_prompts[summary_type]
    try:
        summary = call_gemini(prompts["system"], prompts["user"])
        return SummaryResponse(paper_id=request.paper_id, summary_type=summary_type, summary=summary)
    except Exception as e:
        logger.error(f"Summary generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Summary generation failed: {str(e)}")
