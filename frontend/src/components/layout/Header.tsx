import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import useWorkspaceStore from '../../store/workspaceStore';
import Badge from '../shared/Badge';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/workspace': 'Workspace',
  '/library': 'Paper Library',
  '/settings': 'Settings',
};

export default function Header() {
  const location = useLocation();

  const selectedPaperIds = useWorkspaceStore(
    (s) => s.selectedPaperIds
  );

  const title =
    pageTitles[location.pathname] || 'Research Assistant';

  return (
    <header className="flex items-center justify-between px-6 py-4">
      {/* Page Title */}
      <motion.h1
        key={title}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-bold text-text-primary"
      >
        {title}
      </motion.h1>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {selectedPaperIds.length > 0 && (
          <Badge variant="info">
            {selectedPaperIds.length} paper
            {selectedPaperIds.length > 1 ? 's' : ''} selected
          </Badge>
        )}
      </div>
    </header>
  );
}