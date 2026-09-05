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

class DomainRequest(BaseModel):
    paper_id: str

class DomainResponse(BaseModel):
    paper_id: str
    primary_domain: str
    subfields: List[str]
    keywords: List[str]
    related_disciplines: List[str]
    confidence: float
    rationale: str

@router.post("/api/domain-identify", response_model=DomainResponse)
async def identify_domain(
    request: DomainRequest,
    db: DBSession = Depends(get_db)
):
    paper = db.query(Paper).filter(Paper.id == request.paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found.")
    if not paper.text_content or not paper.text_content.strip():
        raise HTTPException(status_code=400, detail="Paper has no text content.")
    system_prompt = (
        "You are a research domain classification expert. Analyze the given paper and identify its research domain. "
        "Respond ONLY with valid JSON in the following format:\n"
        '{"primary_domain": "...", "subfields": ["..."], "keywords": ["..."], '
        '"related_disciplines": ["..."], "confidence": 0.0, "rationale": "..."}'
    )
    user_prompt = f"""Analyze the following research paper and identify its domain, subfields, keywords, and related disciplines:

{paper.text_content[:8000]}"""
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
                "primary_domain": "Unknown",
                "subfields": [],
                "keywords": [],
                "related_disciplines": [],
                "confidence": 0.0,
                "rationale": result
            }
        return DomainResponse(
            paper_id=request.paper_id,
            primary_domain=data.get("primary_domain", "Unknown"),
            subfields=data.get("subfields", []),
            keywords=data.get("keywords", []),
            related_disciplines=data.get("related_disciplines", []),
            confidence=float(data.get("confidence", 0.0)),
            rationale=data.get("rationale", "")
        )
    except Exception as e:
        logger.error(f"Domain identification failed: {e}")
        raise HTTPException(status_code=500, detail=f"Domain identification failed: {str(e)}")
