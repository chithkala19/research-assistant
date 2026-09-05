import { useMutation } from '@tanstack/react-query';
import {
  generateSummary,
  generateLiteratureSurvey,
  identifyDomain,
  generateCitations,
  generateVisualization,
  checkConsistency,
  searchPapers,
} from '../services/api';
import toast from 'react-hot-toast';

export function useAnalysis() {
  const summaryMutation = useMutation({
    mutationFn: ({ paperId, type }: { paperId: string; type: string }) =>
      generateSummary(paperId, type),
    onError: (e: Error) => toast.error(`Summary failed: ${e.message}`),
  });

  const literatureMutation = useMutation({
    mutationFn: (paperIds: string[]) => generateLiteratureSurvey(paperIds),
    onError: (e: Error) => toast.error(`Literature survey failed: ${e.message}`),
  });

  const domainMutation = useMutation({
    mutationFn: (paperId: string) => identifyDomain(paperId),
    onError: (e: Error) => toast.error(`Domain ID failed: ${e.message}`),
  });

  const citationMutation = useMutation({
    mutationFn: ({ paperId, format }: { paperId: string; format: string }) =>
      generateCitations(paperId, format),
    onError: (e: Error) => toast.error(`Citation failed: ${e.message}`),
  });

  const vizMutation = useMutation({
    mutationFn: ({ paperIds, vizType }: { paperIds: string[]; vizType: string }) =>
      generateVisualization(paperIds, vizType),
    onError: (e: Error) => toast.error(`Visualization failed: ${e.message}`),
  });

  const consistencyMutation = useMutation({
    mutationFn: (paperIds: string[]) => checkConsistency(paperIds),
    onError: (e: Error) => toast.error(`Consistency check failed: ${e.message}`),
  });

  const searchMutation = useMutation({
    mutationFn: ({ query, limit }: { query: string; limit?: number }) =>
      searchPapers(query, limit),
    onError: (e: Error) => toast.error(`Search failed: ${e.message}`),
  });

  return {
    summary: summaryMutation,
    literature: literatureMutation,
    domain: domainMutation,
    citation: citationMutation,
    visualization: vizMutation,
    consistency: consistencyMutation,
    search: searchMutation,
  };
}

export default useAnalysis;
