import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { getPapers } from "../services/api";
import useWorkspaceStore from '../store/workspaceStore';
import DropZone from '../components/upload/DropZone';
import FileCard from '../components/upload/FileCard';
import Loader from '../components/shared/Loader';
import { FileText } from 'lucide-react';

export default function Library() {
  const { setPapers, papers } = useWorkspaceStore();

  const { data, isLoading } = useQuery({
    queryKey: ['papers'],
    queryFn: getPapers,
  });

  useEffect(() => {
    if (data) setPapers(data);
  }, [data, setPapers]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <DropZone />
      </motion.div>

      {isLoading ? (
        <Loader text="Loading papers..." className="py-12" />
      ) : papers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-bg-elevated flex items-center justify-center mb-4">
            <FileText className="w-10 h-10 text-text-muted" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">No Papers Yet</h3>
          <p className="text-sm text-text-secondary">Upload your first research paper to get started</p>
        </motion.div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text-primary">
              Your Papers ({papers.length})
            </h2>
          </div>
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <AnimatePresence>
              {papers.map((paper) => (
                <FileCard key={paper.id} paper={paper} />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </div>
  );
}
