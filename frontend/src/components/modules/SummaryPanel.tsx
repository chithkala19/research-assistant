import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import useWorkspaceStore from '../../store/workspaceStore';
import { useAnalysis } from '../../hooks/useAnalysis';
import Button from '../shared/Button';
import Loader from '../shared/Loader';

const summaryTypes = [
  { value: 'brief', label: 'Brief' },
  { value: 'detailed', label: 'Detailed' },
  { value: 'structured', label: 'Structured' },
];

export default function SummaryPanel() {
  const [type, setType] = useState('brief');
  const [selectedPaper, setSelectedPaper] = useState('');
  const { papers, selectedPaperIds } = useWorkspaceStore();
  const { summary } = useAnalysis();

  const availablePapers = papers.filter((p) => selectedPaperIds.includes(p.id));

  if (availablePapers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <FileText className="w-12 h-12 text-text-muted mb-3" />
        <p className="text-text-secondary">Select papers from the sidebar to generate summaries</p>
      </div>
    );
  }

  const handleGenerate = () => {
    const paperId = selectedPaper || availablePapers[0]?.id;
    if (paperId) summary.mutate({ paperId, type });
  };

  return (
    <div className="space-y-6">
      {/* Paper Selection */}
      <div className="glass-card p-4">
        <label className="block text-sm font-medium text-text-secondary mb-2">Select Paper</label>
        <select
          value={selectedPaper || availablePapers[0]?.id || ''}
          onChange={(e) => setSelectedPaper(e.target.value)}
          className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary/50"
        >
          {availablePapers.map((p) => (
            <option key={p.id} value={p.id}>{p.original_name}</option>
          ))}
        </select>
      </div>

      {/* Summary Type */}
      <div className="glass-card p-4">
        <label className="block text-sm font-medium text-text-secondary mb-3">Summary Type</label>
        <div className="flex gap-2">
          {summaryTypes.map((st) => (
            <button
              key={st.value}
              onClick={() => setType(st.value)}
              className={`
                px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                ${type === st.value
                  ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/20'
                  : 'bg-bg-elevated text-text-secondary hover:text-text-primary hover:bg-bg-surface'
                }
              `}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generate */}
      <Button
        onClick={handleGenerate}
        loading={summary.isPending}
        icon={<Sparkles className="w-4 h-4" />}
        className="w-full"
      >
        Generate Summary
      </Button>

      {/* Result */}
      {summary.isPending && <Loader text="Generating summary..." className="py-8" />}

      {summary.data && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="prose-invert text-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {summary.data.summary}
            </ReactMarkdown>
          </div>
        </motion.div>
      )}
    </div>
  );
}
