import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Sparkles } from 'lucide-react';
import useWorkspaceStore from '../../store/workspaceStore';
import { useAnalysis } from '../../hooks/useAnalysis';
import Button from '../shared/Button';
import Loader from '../shared/Loader';

const vizTypes = [
  { value: 'methodology_distribution', label: 'Methodology Distribution' },
  { value: 'publication_trends', label: 'Publication Trends' },
  { value: 'citation_analysis', label: 'Citation Analysis' },
  { value: 'keyword_frequency', label: 'Keyword Frequency' },
];

export default function VisualizationPanel() {
  const [vizType, setVizType] = useState('methodology_distribution');
  const { selectedPaperIds, papers } = useWorkspaceStore();
  const { visualization } = useAnalysis();
  const selectedPapers = papers.filter((p) => selectedPaperIds.includes(p.id));

  if (selectedPapers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <BarChart3 className="w-12 h-12 text-text-muted mb-3" />
        <p className="text-text-secondary">Select papers to generate visualizations</p>
      </div>
    );
  }

  const handleGenerate = () => {
    visualization.mutate({ paperIds: selectedPaperIds, vizType });
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-4">
        <label className="block text-sm font-medium text-text-secondary mb-3">Visualization Type</label>
        <div className="grid grid-cols-2 gap-2">
          {vizTypes.map((vt) => (
            <button
              key={vt.value}
              onClick={() => setVizType(vt.value)}
              className={`
                px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 text-left
                ${vizType === vt.value
                  ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/20'
                  : 'bg-bg-elevated text-text-secondary hover:text-text-primary hover:bg-bg-surface'
                }
              `}
            >
              {vt.label}
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={handleGenerate}
        loading={visualization.isPending}
        icon={<Sparkles className="w-4 h-4" />}
        className="w-full"
      >
        Generate Visualization
      </Button>

      {visualization.isPending && <Loader text="Creating chart..." className="py-8" />}

      {visualization.data && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-sm font-semibold text-text-primary mb-4">
            {visualization.data.title}
          </h3>
          {visualization.data.image_base64 && (
            <img
              src={`data:image/png;base64,${visualization.data.image_base64}`}
              alt={visualization.data.title}
              className="w-full rounded-xl border border-border-subtle"
            />
          )}
        </motion.div>
      )}
    </div>
  );
}
