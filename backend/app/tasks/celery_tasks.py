import os
import logging
from celery import Celery
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

logger = logging.getLogger(__name__)

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
celery_app = Celery(
    "research_assistant",
    broker=REDIS_URL,
    backend=REDIS_URL
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
)

def _get_db_session():
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./research_assistant.db")
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return Session()

@celery_app.task(bind=True, name="process_paper_task", max_retries=3)
def process_paper_task(self, paper_id: str, file_path: str):
    try:
        logger.info(f"Processing paper {paper_id} from {file_path}")
        from app.services.pdf_extractor import extract_text
        from app.services.rag_engine import index_document
        from app.models.paper import Paper
        extraction_result = extract_text(file_path)
        text_content = extraction_result.get("text", "")
        page_count = extraction_result.get("pages", 0)
        db = _get_db_session()
        try:
            paper = db.query(Paper).filter(Paper.id == paper_id).first()
            if not paper:
                logger.error(f"Paper {paper_id} not found in database")
                return {"status": "error", "message": "Paper not found"}
            paper.text_content = text_content
            paper.page_count = page_count
            if text_content.strip():
                try:
                    index_document(paper_id, text_content)
                    paper.status = "ready"
                except Exception as idx_err:
                    logger.error(f"Indexing failed for {paper_id}: {idx_err}")
                    paper.status = "index_error"
            else:
                paper.status = "empty"
            db.commit()
            logger.info(f"Paper {paper_id} processed successfully. Status: {paper.status}")
            return {
                "status": paper.status,
                "paper_id": paper_id,
                "page_count": page_count,
                "text_length": len(text_content)
            }
        finally:
            db.close()
    except Exception as exc:
        logger.error(f"Error processing paper {paper_id}: {exc}")
        try:
            db = _get_db_session()
            from app.models.paper import Paper
            paper = db.query(Paper).filter(Paper.id == paper_id).first()
            if paper:
                paper.status = "error"
                db.commit()
            db.close()
        except Exception:
            pass
        raise self.retry(exc=exc, countdown=2 ** self.request.retries)
