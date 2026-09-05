import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';
import useWorkspaceStore from '../../store/workspaceStore';
import { useAnalysis } from '../../hooks/useAnalysis';
import Button from '../shared/Button';
import Loader from '../shared/Loader';

export default function ConsistencyChecker() {
  const { selectedPaperIds, papers } = useWorkspaceStore();
  const { consistency } = useAnalysis();
  const selectedPapers = papers.filter((p) => selectedPaperIds.includes(p.id));

  if (selectedPapers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <ShieldCheck className="w-12 h-12 text-text-muted mb-3" />
        <p className="text-text-secondary">Select papers to check for consistency</p>
      </div>
    );
  }

  const handleCheck = () => {
    consistency.mutate(selectedPaperIds);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-error';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-success to-accent-secondary';
    if (score >= 50) return 'from-warning to-orange-500';
    return 'from-error to-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-4">
        <h3 className="text-sm font-medium text-text-secondary mb-3">Papers to Check</h3>
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
        onClick={handleCheck}
        loading={consistency.isPending}
        icon={<Sparkles className="w-4 h-4" />}
        className="w-full"
      >
        Check Consistency
      </Button>

      {consistency.isPending && <Loader text="Checking consistency..." className="py-8" />}

      {consistency.data && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Score */}
          <div className="glass-card p-6 flex items-center gap-6">
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50" cy="50" r="40"
                  fill="none" stroke="#1E2D4A" strokeWidth="8"
                />
                <motion.circle
                  cx="50" cy="50" r="40"
                  fill="none"
                  stroke="url(#scoreGrad)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${consistency.data.score * 2.51} 251`}
                  initial={{ strokeDasharray: '0 251' }}
                  animate={{ strokeDasharray: `${consistency.data.score * 2.51} 251` }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
                <defs>
                  <linearGradient id="scoreGrad">
                    <stop offset="0%" stopColor="#1A73E8" />
                    <stop offset="100%" stopColor="#34A853" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-bold ${getScoreColor(consistency.data.score)}`}>
                  {consistency.data.score}
                </span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">Consistency Score</h3>
              <p className="text-sm text-text-secondary mt-1">
                {consistency.data.score >= 80
                  ? 'Excellent consistency across papers'
                  : consistency.data.score >= 50
                  ? 'Some inconsistencies found'
                  : 'Significant issues detected'}
              </p>
            </div>
          </div>

          {/* Strengths */}
          {consistency.data.strengths.length > 0 && (
            <div className="glass-card p-4">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-success mb-3">
                <CheckCircle2 className="w-4 h-4" /> Strengths
              </h4>
              <ul className="space-y-2">
                {consistency.data.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                    <span className="text-success mt-1">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Issues */}
          {consistency.data.issues.length > 0 && (
            <div className="glass-card p-4">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-error mb-3">
                <AlertTriangle className="w-4 h-4" /> Issues
              </h4>
              <ul className="space-y-2">
                {consistency.data.issues.map((issue, i) => (
                  <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                    <span className="text-error mt-1">•</span> {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {consistency.data.suggestions.length > 0 && (
            <div className="glass-card p-4">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-warning mb-3">
                <Lightbulb className="w-4 h-4" /> Suggestions
              </h4>
              <ul className="space-y-2">
                {consistency.data.suggestions.map((sug, i) => (
                  <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                    <span className="text-warning mt-1">•</span> {sug}
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
