import { motion } from 'framer-motion';
import { FileText, Trash2, Check, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import useWorkspaceStore from '../../store/workspaceStore';
import { deletePaper } from '../../services/api';
import toast from 'react-hot-toast';
import Badge from '../shared/Badge';
import type { Paper } from '../../types';

interface FileCardProps {
  paper: Paper;
}

export default function FileCard({ paper }: FileCardProps) {
  const { selectedPaperIds, togglePaper, removePaper } = useWorkspaceStore();
  const isSelected = selectedPaperIds.includes(paper.id);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deletePaper(paper.id);
      removePaper(paper.id);
      toast.success('Paper deleted');
    } catch {
      toast.error('Failed to delete paper');
    }
  };

  const statusConfig = {
    ready: { icon: CheckCircle2, label: 'Ready', variant: 'success' as const },
    processing: { icon: Clock, label: 'Processing', variant: 'warning' as const },
    error: { icon: AlertCircle, label: 'Error', variant: 'error' as const },
  };

  const status = statusConfig[paper.status] || statusConfig.processing;
  const StatusIcon = status.icon;

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      onClick={() => togglePaper(paper.id)}
      className={`
        glass-card p-4 cursor-pointer transition-all duration-200 hover-lift group
        ${isSelected ? 'border-accent-primary/50 glow-blue' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        <div
          className={`
            w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border mt-0.5
            transition-all duration-200
            ${isSelected
              ? 'bg-accent-primary border-accent-primary'
              : 'border-border-subtle group-hover:border-text-muted'
            }
          `}
        >
          {isSelected && <Check className="w-3 h-3 text-white" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-4 h-4 text-accent-primary flex-shrink-0" />
              <h3 className="text-sm font-medium text-text-primary truncate">
                {paper.original_name}
              </h3>
            </div>
            <button
              onClick={handleDelete}
              className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-error/10 text-text-muted hover:text-error transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
            <span>{paper.page_count} pages</span>
            <span>•</span>
            <span>{formatSize(paper.file_size)}</span>
            <span>•</span>
            <span>{new Date(paper.upload_date).toLocaleDateString()}</span>
          </div>

          <div className="mt-2">
            <Badge variant={status.variant}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {status.label}
            </Badge>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
