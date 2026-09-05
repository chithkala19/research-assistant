import re
from typing import List

def clean_text(text: str) -> str:
    """Clean extracted PDF text by removing noise, fixing encoding, and normalizing whitespace."""
    if not text:
        return ""
    text = re.sub(r'---\s*Page\s+\d+\s*---', '', text)
    text = re.sub(r'\r\n', '\n', text)
    text = re.sub(r'\r', '\n', text)
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)
    text = re.sub(r'\s*-\n\s*', '', text)  # Fix hyphenated line breaks
    text = re.sub(r'(?<!\n)\n(?!\n)', ' ', text)  # Join single line breaks
    text = re.sub(r'\n{3,}', '\n\n', text)  # Limit consecutive newlines
    text = re.sub(r'[ \t]+', ' ', text)
    text = text.replace('\ufeff', '')
    text = text.replace('\u200b', '')
    text = text.replace('\xa0', ' ')
    lines = [line.strip() for line in text.split('\n')]
    text = '\n'.join(lines)
    text = text.strip()
    return text

def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
    """Split text into overlapping chunks for embedding and retrieval."""
    if not text:
        return []
    chunks = []
    paragraphs = re.split(r'\n\n+', text)
    current_chunk = ""
    for paragraph in paragraphs:
        paragraph = paragraph.strip()
        if not paragraph:
            continue
        if len(current_chunk) + len(paragraph) + 2 > chunk_size:
            if current_chunk:
                chunks.append(current_chunk.strip())
                if overlap > 0 and len(current_chunk) > overlap:
                    current_chunk = current_chunk[-overlap:]
                else:
                    current_chunk = ""
            if len(paragraph) > chunk_size:
                sentences = re.split(r'(?<=[.!?])\s+', paragraph)
                for sentence in sentences:
                    if len(current_chunk) + len(sentence) + 1 > chunk_size:
                        if current_chunk:
                            chunks.append(current_chunk.strip())
                            if overlap > 0 and len(current_chunk) > overlap:
                                current_chunk = current_chunk[-overlap:]
                            else:
                                current_chunk = ""
                        if len(sentence) > chunk_size:
                            for i in range(0, len(sentence), chunk_size - overlap):
                                chunk = sentence[i:i + chunk_size]
                                if chunk.strip():
                                    chunks.append(chunk.strip())
                            current_chunk = ""
                        else:
                            current_chunk = sentence
                    else:
                        current_chunk = (current_chunk + " " + sentence).strip() if current_chunk else sentence
            else:
                current_chunk = (current_chunk + "\n\n" + paragraph).strip() if current_chunk else paragraph
        else:
            current_chunk = (current_chunk + "\n\n" + paragraph).strip() if current_chunk else paragraph
    if current_chunk.strip():
        chunks.append(current_chunk.strip())
    if len(chunks) > 1:
        chunks = [c for c in chunks if len(c) >= 50]
    return chunks if chunks else ([text[:chunk_size]] if text.strip() else [])
