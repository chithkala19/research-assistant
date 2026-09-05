import fitz  # PyMuPDF
import pdfplumber
import logging
import re
from pathlib import Path

logger = logging.getLogger(__name__)

def extract_text(file_path: str) -> dict:
    result = {"text": "", "pages": 0, "metadata": {}}
    try:
        doc = fitz.open(file_path)
        result["pages"] = len(doc)
        result["metadata"] = {
            "title": doc.metadata.get("title", "") or "",
            "author": doc.metadata.get("author", "") or "",
            "subject": doc.metadata.get("subject", "") or "",
            "keywords": doc.metadata.get("keywords", "") or "",
            "creator": doc.metadata.get("creator", "") or "",
            "producer": doc.metadata.get("producer", "") or "",
            "page_count": len(doc),
        }
        all_text = []
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text("text")
            if text.strip():
                all_text.append(f"--- Page {page_num + 1} ---\n{text}")
        result["text"] = "\n\n".join(all_text)
        doc.close()
    except Exception as e:
        logger.error(f"Error extracting text from {file_path}: {e}")
        try:
            with pdfplumber.open(file_path) as pdf:
                result["pages"] = len(pdf.pages)
                all_text = []
                for i, page in enumerate(pdf.pages):
                    text = page.extract_text() or ""
                    if text.strip():
                        all_text.append(f"--- Page {i + 1} ---\n{text}")
                result["text"] = "\n\n".join(all_text)
                result["metadata"] = pdf.metadata or {}
        except Exception as e2:
            logger.error(f"Fallback extraction also failed for {file_path}: {e2}")
    return result

def extract_tables(file_path: str) -> list[dict]:
    tables = []
    try:
        with pdfplumber.open(file_path) as pdf:
            for page_num, page in enumerate(pdf.pages):
                page_tables = page.extract_tables() or []
                for table_idx, table in enumerate(page_tables):
                    if not table or len(table) < 2:
                        continue
                    headers = [str(cell or "").strip() for cell in table[0]]
                    rows = []
                    for row in table[1:]:
                        cleaned_row = [str(cell or "").strip() for cell in row]
                        rows.append(cleaned_row)
                    tables.append({
                        "page": page_num + 1,
                        "table_index": table_idx,
                        "headers": headers,
                        "rows": rows
                    })
    except Exception as e:
        logger.error(f"Error extracting tables from {file_path}: {e}")
    return tables

def extract_sections(text: str) -> dict[str, str]:
    sections = {}
    section_patterns = [
        r'^(?:(?:\d+\.?\s+)?)(Abstract)\s*$',
        r'^(?:(?:\d+\.?\s+)?)(Introduction)\s*$',
        r'^(?:(?:\d+\.?\s+)?)(Background|Related\s+Work|Literature\s+Review)\s*$',
        r'^(?:(?:\d+\.?\s+)?)(Methodology|Methods?|Approach|Proposed\s+Method)\s*$',
        r'^(?:(?:\d+\.?\s+)?)(Experiments?|Experimental\s+Setup|Implementation)\s*$',
        r'^(?:(?:\d+\.?\s+)?)(Results?|Findings)\s*$',
        r'^(?:(?:\d+\.?\s+)?)(Discussion)\s*$',
        r'^(?:(?:\d+\.?\s+)?)(Conclusion|Conclusions|Summary)\s*$',
        r'^(?:(?:\d+\.?\s+)?)(References|Bibliography)\s*$',
        r'^(?:(?:\d+\.?\s+)?)(Appendix|Appendices)\s*$',
        r'^(?:(?:\d+\.?\s+)?)(Acknowledgm?ents?)\s*$',
    ]
    lines = text.split('\n')
    current_section = "Preamble"
    current_content = []
    for line in lines:
        stripped = line.strip()
        is_heading = False
        for pattern in section_patterns:
            match = re.match(pattern, stripped, re.IGNORECASE)
            if match:
                if current_content:
                    content = '\n'.join(current_content).strip()
                    if content:
                        sections[current_section] = content
                current_section = stripped
                current_content = []
                is_heading = True
                break
        if not is_heading:
            numbered_match = re.match(r'^(\d+\.\d*\s+.+)$', stripped)
            if numbered_match and len(stripped) < 80 and stripped.isupper() or (numbered_match and len(stripped.split()) <= 8):
                if current_content:
                    content = '\n'.join(current_content).strip()
                    if content:
                        sections[current_section] = content
                current_section = stripped
                current_content = []
            else:
                current_content.append(line)
    if current_content:
        content = '\n'.join(current_content).strip()
        if content:
            sections[current_section] = content
    if not sections or (len(sections) == 1 and "Preamble" in sections):
        sections = {"Full Text": text}
    return sections
