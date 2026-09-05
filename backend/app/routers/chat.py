import logging
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session as DBSession

from app.database import get_db
from app.models.paper import Paper
from app.services.rag_engine import query_documents
from app.services.llm_client import call_gemini_multiturn
from app.services.vector_store import query_collection

logger = logging.getLogger(__name__)
router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    paper_ids: List[str]
    message: str
    history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    answer: str
    sources: List[str]

@router.post("/api/chat", response_model=ChatResponse)
async def chat_with_papers(
    request: ChatRequest,
    db: DBSession = Depends(get_db)
):
    if not request.paper_ids:
        raise HTTPException(status_code=400, detail="At least one paper_id is required.")
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")
    valid_paper_ids = []
    for pid in request.paper_ids:
        paper = db.query(Paper).filter(Paper.id == pid).first()
        if paper:
            valid_paper_ids.append(pid)
    if not valid_paper_ids:
        raise HTTPException(status_code=404, detail="No valid papers found.")
    try:
        all_chunks = []
        for paper_id in valid_paper_ids:
            chunks = query_collection(paper_id, request.message, n_results=5)
            for chunk in chunks:
                all_chunks.append(chunk)
        context = "\n\n---\n\n".join(all_chunks[:15]) if all_chunks else "No relevant context found."
        system_prompt = (
            "You are a research assistant helping users understand academic papers. "
            "Answer the user's question based on the provided context from research papers. "
            "If the context doesn't contain enough information, say so clearly. "
            "Be precise, thorough, and academic in your response."
        )
        messages = []
        if request.history:
            for msg in request.history:
                messages.append({"role": msg.role, "content": msg.content})
        augmented_message = f"""Context from research papers:

{context}

---

User Question: {request.message}"""
        messages.append({"role": "user", "content": augmented_message})
        if len(messages) > 1:
            answer = call_gemini_multiturn(system_prompt, messages)
        else:
            answer = query_documents(valid_paper_ids, request.message)
        sources = [f"Paper {pid[:8]}..." for pid in valid_paper_ids]
        return ChatResponse(answer=answer, sources=sources)
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {str(e)}")
