import logging
from app.services.vector_store import create_collection, query_collection
from app.services.llm_client import call_gemini
from app.utils.text_cleaner import chunk_text, clean_text

logger = logging.getLogger(__name__)

def index_document(paper_id: str, text_content: str) -> bool:
    try:
        cleaned = clean_text(text_content)
        chunks = chunk_text(cleaned, chunk_size=1000)
        if not chunks:
            logger.warning(f"No text chunks generated for paper {paper_id}")
            return False
        success = create_collection(paper_id, chunks)
        if success:
            logger.info(f"Successfully indexed {len(chunks)} chunks for paper {paper_id}")
        return success
    except Exception as e:
        logger.error(f"Error indexing document {paper_id}: {e}")
        return False

def query_documents(paper_ids: list[str], query: str, n_results: int = 5) -> str:
    try:
        all_chunks = []
        for paper_id in paper_ids:
            chunks = query_collection(paper_id, query, n_results=n_results)
            for chunk in chunks:
                all_chunks.append(f"[Paper {paper_id[:8]}] {chunk}")
        if not all_chunks:
            return "No relevant content found in the selected papers. Please ensure the papers have been properly uploaded and indexed."
        context = "\n\n---\n\n".join(all_chunks[:15])
        system_prompt = (
            "You are a research assistant helping users understand academic papers. "
            "Answer the user's question based ONLY on the provided context from research papers. "
            "If the context doesn't contain enough information to answer the question, say so clearly. "
            "Cite specific parts of the papers when possible. "
            "Be precise, thorough, and academic in your response."
        )
        user_prompt = f"""Context from research papers:

{context}

---

User Question: {query}

Please provide a detailed, well-structured answer based on the context above."""
        answer = call_gemini(system_prompt, user_prompt)
        return answer
    except Exception as e:
        logger.error(f"Error in RAG query: {e}")
        return f"An error occurred while processing your question: {str(e)}"
