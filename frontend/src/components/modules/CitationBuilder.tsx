import { useState } from 'react';
import { motion } from 'framer-motion';
import { Quote, Copy, Check, Sparkles } from 'lucide-react';
import useWorkspaceStore from '../../store/workspaceStore';
import { useAnalysis } from '../../hooks/useAnalysis';
import Button from '../shared/Button';
import Loader from '../shared/Loader';
import toast from 'react-hot-toast';

const formats = [
  { value: 'apa', label: 'APA' },
  { value: 'mla', label: 'MLA' },
  { value: 'chicago', label: 'Chicago' },
  { value: 'bibtex', label: 'BibTeX' },
];

export default function CitationBuilder() {
  const [format, setFormat] = useState('apa');
  const [selectedPaper, setSelectedPaper] = useState('');
  const [copied, setCopied] = useState(false);
  const { papers, selectedPaperIds } = useWorkspaceStore();
  const { citation } = useAnalysis();
  const availablePapers = papers.filter((p) => selectedPaperIds.includes(p.id));

  if (availablePapers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Quote className="w-12 h-12 text-text-muted mb-3" />
        <p className="text-text-secondary">Select a paper to generate citations</p>
      </div>
    );
  }

  const handleGenerate = () => {
    const paperId = selectedPaper || availablePapers[0]?.id;
    if (paperId) citation.mutate({ paperId, format });
  };

  const handleCopy = () => {
    if (citation.data) {
      navigator.clipboard.writeText(citation.data.citation);
      setCopied(true);
      toast.success('Citation copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
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

      <div className="glass-card p-4">
        <label className="block text-sm font-medium text-text-secondary mb-3">Citation Format</label>
        <div className="flex gap-2">
          {formats.map((f) => (
            <button
              key={f.value}
              onClick={() => setFormat(f.value)}
              className={`
                px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                ${format === f.value
                  ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/20'
                  : 'bg-bg-elevated text-text-secondary hover:text-text-primary hover:bg-bg-surface'
                }
              `}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={handleGenerate}
        loading={citation.isPending}
        icon={<Sparkles className="w-4 h-4" />}
        className="w-full"
      >
        Generate Citation
      </Button>

      {citation.isPending && <Loader text="Generating citation..." className="py-8" />}

      {citation.data && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <pre className="font-mono text-sm text-text-primary whitespace-pre-wrap flex-1 leading-relaxed">
              {citation.data.citation}
            </pre>
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg bg-bg-elevated hover:bg-bg-surface text-text-secondary hover:text-text-primary transition-all flex-shrink-0"
            >
              {copied ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
