import { motion } from 'framer-motion';
import { BookOpen, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import useWorkspaceStore from '../../store/workspaceStore';
import { useAnalysis } from '../../hooks/useAnalysis';
import Button from '../shared/Button';
import Loader from '../shared/Loader';

export default function LiteratureSurvey() {
  const { selectedPaperIds, papers } = useWorkspaceStore();
  const { literature } = useAnalysis();
  const selectedPapers = papers.filter((p) => selectedPaperIds.includes(p.id));

  if (selectedPapers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <BookOpen className="w-12 h-12 text-text-muted mb-3" />
        <p className="text-text-secondary">Select multiple papers to generate a literature survey</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-4">
        <h3 className="text-sm font-medium text-text-secondary mb-3">Selected Papers</h3>
        <div className="space-y-2">
          {selectedPapers.map((p) => (
            <div key={p.id} className="flex items-center gap-2 text-sm text-text-primary">
              <div className="w-2 h-2 rounded-full bg-accent-primary" />
              <span className="truncate">{p.original_name}</span>
            </div>
          ))}
        </div>
      </div>

      <Button
        onClick={() => literature.mutate(selectedPaperIds)}
        loading={literature.isPending}
        icon={<Sparkles className="w-4 h-4" />}
        className="w-full"
      >
        Generate Literature Survey
      </Button>

      {literature.isPending && <Loader text="Analyzing papers..." className="py-8" />}

      {literature.data && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="prose-invert text-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {literature.data.survey}
            </ReactMarkdown>
          </div>

          {literature.data.themes && literature.data.themes.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border-subtle">
              <h4 className="text-sm font-semibold text-text-primary mb-2">Key Themes</h4>
              <div className="flex flex-wrap gap-2">
                {literature.data.themes.map((theme, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-accent-primary/10 text-accent-primary text-xs">
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}

          {literature.data.gaps && literature.data.gaps.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border-subtle">
              <h4 className="text-sm font-semibold text-text-primary mb-2">Research Gaps</h4>
              <ul className="space-y-1">
                {literature.data.gaps.map((gap, i) => (
                  <li key={i} className="text-sm text-warning flex items-start gap-2">
                    <span className="text-warning mt-1">•</span>
                    {gap}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
