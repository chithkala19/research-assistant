import json
import logging
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session as DBSession

from app.database import get_db
from app.models.paper import Paper
from app.services.llm_client import call_gemini

logger = logging.getLogger(__name__)
router = APIRouter()

class ConsistencyRequest(BaseModel):
    paper_ids: List[str]

class ConsistencyIssue(BaseModel):
    type: str
    description: str
    severity: str
    location: Optional[str] = None

class ConsistencyResponse(BaseModel):
    score: float
    strengths: List[str]
    issues: List[ConsistencyIssue]
    suggestions: List[str]
    overall_assessment: str

@router.post("/api/consistency-check", response_model=ConsistencyResponse)
async def check_consistency(
    request: ConsistencyRequest,
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
    max_chars = 8000 // len(papers) if len(papers) > 0 else 8000
    max_chars = max(max_chars, 2000)
    paper_texts = []
    for i, p in enumerate(papers):
        paper_texts.append(f"--- Paper {i+1}: {p.original_name} ---\n{p.text_content[:max_chars]}")
    combined = "\n\n".join(paper_texts)
    if len(papers) == 1:
        analysis_type = "internal consistency of the paper (methodology alignment, logical flow, claim support)"
    else:
        analysis_type = "cross-paper consistency (conflicting claims, methodology differences, contradictory findings)"
    system_prompt = (
        "You are a quality reviewer and consistency checker for academic papers. "
        f"Analyze the {analysis_type}. "
        "Respond ONLY with valid JSON in this format:\n"
        '{"score": 7.5, "strengths": ["..."], "issues": [{"type": "...", "description": "...", '
        '"severity": "low|medium|high", "location": "..."}], "suggestions": ["..."], '
        '"overall_assessment": "..."}'
    )
    user_prompt = f"""Analyze the consistency of the following paper(s):

{combined}"""
    try:
        result = call_gemini(system_prompt, user_prompt)
        try:
            json_str = result.strip()
            if json_str.startswith("```"):
                json_str = json_str.split("```")[1]
                if json_str.startswith("json"):
                    json_str = json_str[4:]
            json_str = json_str.strip().rstrip("`")
            data = json.loads(json_str)
        except json.JSONDecodeError:
            data = {
                "score": 0,
                "strengths": ["Analysis completed"],
                "issues": [{"type": "parse_error", "description": "Could not parse structured response", "severity": "low"}],
                "suggestions": ["Try again or check API configuration"],
                "overall_assessment": result[:500]
            }
        issues = []
        for issue in data.get("issues", []):
            if isinstance(issue, dict):
                issues.append(ConsistencyIssue(
                    type=issue.get("type", "general"),
                    description=issue.get("description", ""),
                    severity=issue.get("severity", "low"),
                    location=issue.get("location")
                ))
            elif isinstance(issue, str):
                issues.append(ConsistencyIssue(
                    type="general", description=issue, severity="medium"
                ))
        return ConsistencyResponse(
            score=float(data.get("score", 0)),
            strengths=data.get("strengths", []),
            issues=issues,
            suggestions=data.get("suggestions", []),
            overall_assessment=data.get("overall_assessment", "")
        )
    except Exception as e:
        logger.error(f"Consistency check failed: {e}")
        raise HTTPException(status_code=500, detail=f"Consistency check failed: {str(e)}")
