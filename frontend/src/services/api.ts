import axios from 'axios';
import type {
  Paper,
  SummaryResult,
  DomainResult,
  CitationResult,
  ConsistencyResult,
  LiteratureSurveyResult,
  VisualizationResult,
  SearchResult,
  ApiStatus
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000,
});

// ======================================================
// Upload
// ======================================================

export const uploadPaper = async (
  file: File,
  onProgress?: (pct: number) => void
): Promise<Paper> => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (event) => {
      if (onProgress && event.total) {
        onProgress(Math.round((event.loaded * 100) / event.total));
      }
    },
  });

  return data;
};

// ======================================================
// Papers
// ======================================================

export const getPapers = async (): Promise<Paper[]> => {
  const response = await api.get('/papers');

  console.log("GET /papers response:", response.data);

  // Backend returns:
  // {
  //    papers: [...],
  //    total: number
  // }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.data.papers)) {
    return response.data.papers;
  }

  return [];
};

export const getPaper = async (id: string): Promise<Paper> => {
  const { data } = await api.get(`/papers/${id}`);
  return data;
};

export const deletePaper = async (id: string): Promise<void> => {
  await api.delete(`/papers/${id}`);
};

// ======================================================
// Chat
// ======================================================

export const sendChatMessage = async (
  paperIds: string[],
  message: string,
  history: { role: string; content: string }[]
): Promise<{
  answer: string;
  per_paper?: Record<string, string>;
}> => {
  const { data } = await api.post('/chat', {
    paper_ids: paperIds,
    message,
    history,
  });

  return data;
};

// ======================================================
// Summary
// ======================================================

export const generateSummary = async (
  paperId: string,
  summaryType: string
): Promise<SummaryResult> => {
  const { data } = await api.post('/summary', {
    paper_id: paperId,
    summary_type: summaryType,
  });

  return data;
};

// ======================================================
// Literature Survey
// ======================================================

export const generateLiteratureSurvey = async (
  paperIds: string[]
): Promise<LiteratureSurveyResult> => {
  const { data } = await api.post('/literature-survey', {
    paper_ids: paperIds,
  });

  return data;
};

// ======================================================
// Domain Identification
// ======================================================

export const identifyDomain = async (
  paperId: string
): Promise<DomainResult> => {
  const { data } = await api.post('/domain-identify', {
    paper_id: paperId,
  });

  return data;
};

// ======================================================
// Citations
// ======================================================

export const generateCitations = async (
  paperId: string,
  format: string
): Promise<CitationResult> => {
  const { data } = await api.post('/citations', {
    paper_id: paperId,
    format,
  });

  return data;
};

// ======================================================
// Real-time Search
// ======================================================

export const searchPapers = async (
  query: string,
  limit = 10
): Promise<SearchResult[]> => {
  const { data } = await api.post('/realtime-search', {
    query,
    limit,
  });

  return data.results ?? [];
};

// ======================================================
// Visualization
// ======================================================

export const generateVisualization = async (
  paperIds: string[],
  vizType: string
): Promise<VisualizationResult> => {
  const { data } = await api.post('/visualization', {
    paper_ids: paperIds,
    viz_type: vizType,
  });

  return data;
};

// ======================================================
// Consistency Check
// ======================================================

export const checkConsistency = async (
  paperIds: string[]
): Promise<ConsistencyResult> => {
  const { data } = await api.post('/consistency-check', {
    paper_ids: paperIds,
  });

  return data;
};

// ======================================================
// Status
// ======================================================

export const getStatus = async (): Promise<ApiStatus> => {
  const { data } = await api.get('/status');
  return data;
};

export default api;