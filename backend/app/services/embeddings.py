import os
from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEmbeddings

load_dotenv()

_embedding_model = None


def get_embeddings():
    """
    Returns a singleton embedding model.

    Uses a local HuggingFace embedding model instead of Gemini embeddings.
    This avoids API incompatibilities and works perfectly with ChromaDB.
    """

    global _embedding_model

    if _embedding_model is None:
        _embedding_model = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},
        )

    return _embedding_model