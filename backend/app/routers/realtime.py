import logging
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List

from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

class RealtimeSearchRequest(BaseModel):
    query: str
    limit: Optional[int] = 10

class SearchResultPaper(BaseModel):
    paperId: Optional[str] = None
    title: Optional[str] = None
    abstract: Optional[str] = None
    year: Optional[int] = None
    citationCount: Optional[int] = None
    url: Optional[str] = None
    authors: List[str] = []
    venue: Optional[str] = None

class RealtimeSearchResponse(BaseModel):
    query: str
    results: List[SearchResultPaper]
    total: int

@router.post("/api/realtime-search", response_model=RealtimeSearchResponse)
async def realtime_search(request: RealtimeSearchRequest):
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Search query cannot be empty.")
    limit = min(request.limit or 10, 50)
    try:
        headers = {}
        if settings.SEMANTIC_SCHOLAR_API_KEY:
            headers["x-api-key"] = settings.SEMANTIC_SCHOLAR_API_KEY
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                "https://api.semanticscholar.org/graph/v1/paper/search",
                params={
                    "query": request.query,
                    "limit": limit,
                    "fields": "paperId,title,abstract,year,citationCount,url,authors,venue"
                },
                headers=headers
            )
        if response.status_code == 429:
            raise HTTPException(status_code=429, detail="Rate limited by Semantic Scholar API. Please try again later.")
        if response.status_code != 200:
            logger.error(f"Semantic Scholar API error: {response.status_code} - {response.text}")
            raise HTTPException(status_code=502, detail=f"Semantic Scholar API returned status {response.status_code}")
        data = response.json()
        papers_data = data.get("data", [])
        total = data.get("total", len(papers_data))
        results = []
        for p in papers_data:
            authors = []
            for author in (p.get("authors") or []):
                name = author.get("name", "")
                if name:
                    authors.append(name)
            results.append(SearchResultPaper(
                paperId=p.get("paperId"),
                title=p.get("title"),
                abstract=p.get("abstract"),
                year=p.get("year"),
                citationCount=p.get("citationCount"),
                url=p.get("url") or (f"https://www.semanticscholar.org/paper/{p.get('paperId')}" if p.get("paperId") else None),
                authors=authors,
                venue=p.get("venue")
            ))
        return RealtimeSearchResponse(query=request.query, results=results, total=total)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Realtime search failed: {e}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")
