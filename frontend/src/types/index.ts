export interface Paper {
  id: string;
  filename: string;
  original_name: string;
  upload_date: string;
  page_count: number;
  status: 'processing' | 'ready' | 'error';
  file_size: number;
  session_id?: string;
  text_content?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  paper_ids?: string[];
}

export interface SummaryResult {
  summary: string;
  key_findings?: string[];
  methodology?: string;
  conclusions?: string;
}

export interface DomainResult {
  primary_domain: string;
  subfields: string[];
  keywords: string[];
  related_disciplines: string[];
  confidence: number;
  rationale: string;
}

export interface CitationResult {
  citation: string;
  format: string;
}

export interface ConsistencyResult {
  score: number;
  strengths: string[];
  issues: string[];
  suggestions: string[];
}

export interface LiteratureSurveyResult {
  survey: string;
  themes?: string[];
  gaps?: string[];
}

export interface VisualizationResult {
  image_base64: string;
  chart_type: string;
  title: string;
}

export interface SearchResult {
  paperId: string;
  title: string;
  abstract: string;
  year: number;
  authors: string[];
  citationCount: number;
  url: string;
}

export interface ApiStatus {
  status: string;
  stub_mode: boolean;
  gemini_model: string;
  timestamp: string;
  database?: string;
  upload_dir?: string;
  chroma_dir?: string;
}
