import logging
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from sqlalchemy.orm import Session as DBSession

from app.database import get_db
from app.models.paper import Paper
from app.services.llm_client import call_gemini

logger = logging.getLogger(__name__)
router = APIRouter()

class LiteratureSurveyRequest(BaseModel):
    paper_ids: List[str]

class LiteratureSurveyResponse(BaseModel):
    survey: str
    paper_count: int

@router.post("/api/literature-survey", response_model=LiteratureSurveyResponse)
async def generate_literature_survey(
    request: LiteratureSurveyRequest,
    db: DBSession = Depends(get_db)
):
    if not request.paper_ids:
        raise HTTPException(status_code=400, detail="At least one paper_id is required.")
    papers = []
    for pid in request.paper_ids:
        paper = db.query(Paper).filter(Paper.id == pid).first()
        if paper and paper.text_content:
            papers.append(paper)
    if not papers:
        raise HTTPException(status_code=404, detail="No valid papers with content found.")
    max_chars_per_paper = 6000 // len(papers) if len(papers) > 0 else 6000
    max_chars_per_paper = max(max_chars_per_paper, 2000)
    paper_texts = []
    for i, paper in enumerate(papers):
        truncated = paper.text_content[:max_chars_per_paper]
        paper_texts.append(f"--- Paper {i+1}: {paper.original_name} ---\n{truncated}")
    combined = "\n\n".join(paper_texts)
    system_prompt = (
        "You are an expert academic researcher specializing in literature reviews. "
        "Create a comprehensive literature survey that synthesizes the provided papers. "
        "Include: an overview of the research landscape, common themes, methodological approaches, "
        "key findings across papers, gaps in the literature, and future research directions. "
        "Organize the survey with clear sections and maintain academic rigor."
    )
    user_prompt = f"""Please create a comprehensive literature survey based on the following {len(papers)} research papers:

{combined}

Generate a well-structured literature survey covering:
1. Introduction and Research Landscape
2. Common Themes and Theoretical Frameworks
3. Methodological Approaches
4. Key Findings and Contributions
5. Comparative Analysis
6. Research Gaps
7. Future Research Directions
8. Conclusion"""
    try:
        survey = call_gemini(system_prompt, user_prompt)
        return LiteratureSurveyResponse(survey=survey, paper_count=len(papers))
    except Exception as e:
        logger.error(f"Literature survey generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Literature survey generation failed: {str(e)}")
