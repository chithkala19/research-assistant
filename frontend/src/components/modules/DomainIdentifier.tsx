import { useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, Sparkles } from 'lucide-react';
import useWorkspaceStore from '../../store/workspaceStore';
import { useAnalysis } from '../../hooks/useAnalysis';
import Button from '../shared/Button';
import Loader from '../shared/Loader';
import Badge from '../shared/Badge';

export default function DomainIdentifier() {
  const [selectedPaper, setSelectedPaper] = useState('');
  const { papers, selectedPaperIds } = useWorkspaceStore();
  const { domain } = useAnalysis();
  const availablePapers = papers.filter((p) => selectedPaperIds.includes(p.id));

  if (availablePapers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Compass className="w-12 h-12 text-text-muted mb-3" />
        <p className="text-text-secondary">Select a paper to identify its research domain</p>
      </div>
    );
  }

  const handleIdentify = () => {
    const paperId = selectedPaper || availablePapers[0]?.id;
    if (paperId) domain.mutate(paperId);
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

      <Button
        onClick={handleIdentify}
        loading={domain.isPending}
        icon={<Sparkles className="w-4 h-4" />}
        className="w-full"
      >
        Identify Domain
      </Button>

      {domain.isPending && <Loader text="Analyzing domain..." className="py-8" />}

      {domain.data && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Primary Domain */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-text-primary mb-1">
              {domain.data.primary_domain}
            </h3>
            <p className="text-sm text-text-secondary">{domain.data.rationale}</p>
          </div>

          {/* Confidence */}
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">Confidence</span>
              <span className="text-sm font-mono text-accent-primary">
                {Math.round(domain.data.confidence * 100)}%
              </span>
            </div>
            <div className="w-full bg-bg-primary rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${domain.data.confidence * 100}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full"
              />
            </div>
          </div>

          {/* Subfields */}
          <div className="glass-card p-4">
            <h4 className="text-sm font-medium text-text-secondary mb-3">Subfields</h4>
            <div className="flex flex-wrap gap-2">
              {domain.data.subfields.map((sf, i) => (
                <Badge key={i} variant="info">{sf}</Badge>
              ))}
            </div>
          </div>

          {/* Keywords */}
          <div className="glass-card p-4">
            <h4 className="text-sm font-medium text-text-secondary mb-3">Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {domain.data.keywords.map((kw, i) => (
                <Badge key={i} variant="default">{kw}</Badge>
              ))}
            </div>
          </div>

          {/* Related Disciplines */}
          <div className="glass-card p-4">
            <h4 className="text-sm font-medium text-text-secondary mb-3">Related Disciplines</h4>
            <div className="flex flex-wrap gap-2">
              {domain.data.related_disciplines.map((rd, i) => (
                <Badge key={i} variant="success">{rd}</Badge>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
