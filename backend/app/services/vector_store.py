import chromadb
from chromadb.config import Settings as ChromaSettings
from app.config import settings
from app.services.embeddings import get_embeddings
import os
import logging

logger = logging.getLogger(__name__)

def _get_client():
    persist_dir = settings.CHROMA_PERSIST_DIR
    os.makedirs(persist_dir, exist_ok=True)
    client = chromadb.PersistentClient(path=persist_dir)
    return client

def _sanitize_collection_name(paper_id: str) -> str:
    name = f"paper_{paper_id.replace('-', '_')}"
    if len(name) > 63:
        name = name[:63]
    return name

def create_collection(paper_id: str, chunks: list[str]) -> bool:
    try:
        client = _get_client()
        collection_name = _sanitize_collection_name(paper_id)
        try:
            client.delete_collection(name=collection_name)
        except Exception:
            pass
        embeddings = get_embeddings()
        collection = client.create_collection(
            name=collection_name,
            metadata={"paper_id": paper_id}
        )
        if not chunks:
            logger.warning(f"No chunks to index for paper {paper_id}")
            return True
        ids = [f"{paper_id}_chunk_{i}" for i in range(len(chunks))]
        chunk_embeddings = embeddings.embed_documents(chunks)
        batch_size = 100
        for i in range(0, len(chunks), batch_size):
            batch_end = min(i + batch_size, len(chunks))
            collection.add(
                ids=ids[i:batch_end],
                documents=chunks[i:batch_end],
                embeddings=chunk_embeddings[i:batch_end],
                metadatas=[{"paper_id": paper_id, "chunk_index": j} for j in range(i, batch_end)]
            )
        logger.info(f"Indexed {len(chunks)} chunks for paper {paper_id}")
        return True
    except Exception as e:
        logger.error(f"Error creating collection for paper {paper_id}: {e}")
        return False

def query_collection(paper_id: str, query: str, n_results: int = 5) -> list[str]:

    try:

        client = _get_client()

        collection_name = _sanitize_collection_name(paper_id)

        collection = client.get_collection(name=collection_name)

        if collection.count() == 0:
            logger.warning(f"Collection {collection_name} is empty.")
            return []

        embeddings = get_embeddings()

        query_embedding = embeddings.embed_query(query)

        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=min(n_results, collection.count()),
        )

        documents = results.get("documents", [])

        if not documents:
            return []

        return documents[0]

    except Exception as e:
        logger.exception(e)
        return []

def delete_collection(paper_id: str) -> bool:
    try:
        client = _get_client()
        collection_name = _sanitize_collection_name(paper_id)
        try:
            client.delete_collection(name=collection_name)
            logger.info(f"Deleted collection for paper {paper_id}")
        except Exception:
            logger.warning(f"Collection not found for deletion: {paper_id}")
        return True
    except Exception as e:
        logger.error(f"Error deleting collection for paper {paper_id}: {e}")
        return False
