import json
import logging
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session as DBSession

from app.database import get_db
from app.models.paper import Paper
from app.services.llm_client import call_gemini
from app.utils.chart_builder import build_chart

logger = logging.getLogger(__name__)
router = APIRouter()


class VisualizationRequest(BaseModel):
    paper_ids: List[str]
    viz_type: Optional[str] = "keyword_frequency"


class VisualizationResponse(BaseModel):
    chart_image: str
    chart_data: dict
    description: str


@router.post("/api/visualization", response_model=VisualizationResponse)
async def generate_visualization(
    request: VisualizationRequest,
    db: DBSession = Depends(get_db),
):

    if not request.paper_ids:
        raise HTTPException(
            status_code=400,
            detail="At least one paper_id is required.",
        )

    papers = []

    for pid in request.paper_ids:
        paper = db.query(Paper).filter(Paper.id == pid).first()

        if paper and paper.text_content:
            papers.append(paper)

    if not papers:
        raise HTTPException(
            status_code=404,
            detail="No valid papers found.",
        )

    max_chars = max(1500, 4000 // len(papers))

    combined = "\n\n".join(
        f"{p.original_name}\n{p.text_content[:max_chars]}"
        for p in papers
    )

    system_prompt = """
You are a data visualization expert.

Return ONLY valid JSON.

{
    "chart_type":"bar",
    "title":"...",
    "ylabel":"...",
    "labels":["..."],
    "series":{
        "Series":[1,2,3]
    }
}
"""

    user_prompt = f"""
Generate visualization data from:

{combined}
"""

    chart_data = None

    try:

        result = call_gemini(system_prompt, user_prompt)

        json_str = result.strip()

        if json_str.startswith("```"):
            json_str = json_str.split("```")[1]

            if json_str.startswith("json"):
                json_str = json_str[4:]

        chart_data = json.loads(json_str.strip())

        logger.info("Gemini chart generated successfully.")

    except Exception as e:

        logger.warning(f"Gemini unavailable. Using fallback. {e}")

        chart_data = {
            "chart_type": "bar",
            "title": "Uploaded Papers",
            "ylabel": "Pages",
            "labels": [p.original_name for p in papers],
            "series": {
                "Pages": [
                    p.page_count if p.page_count else 0
                    for p in papers
                ]
            },
        }

    chart_image = build_chart(chart_data)

    return VisualizationResponse(
        chart_image=chart_image,
        chart_data=chart_data,
        description="Visualization generated successfully.",
    )