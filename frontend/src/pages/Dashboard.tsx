import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FlaskConical,
  BookOpen,
  Upload,
  Brain,
  FileText,
  MessageSquare,
  BarChart3,
  ArrowRight,
  Zap,
  Shield,
  Globe,
} from 'lucide-react';

import { getPapers } from '../services/api';
import useWorkspaceStore from '../store/workspaceStore';
import Button from '../components/shared/Button';

const features = [
  {
    icon: MessageSquare,
    title: 'RAG Chat',
    desc: 'Ask questions about your papers with context-aware AI',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: FileText,
    title: 'Smart Summaries',
    desc: 'Generate brief, detailed, or structured summaries',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: BookOpen,
    title: 'Literature Survey',
    desc: 'Synthesize themes and gaps across papers',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Globe,
    title: 'Real-Time Search',
    desc: 'Search Semantic Scholar for related work',
    color: 'from-orange-500 to-amber-500',
  },
  {
    icon: BarChart3,
    title: 'Visualizations',
    desc: 'Generate charts and data visualizations',
    color: 'from-rose-500 to-red-500',
  },
  {
    icon: Shield,
    title: 'Consistency Check',
    desc: 'Identify inconsistencies across papers',
    color: 'from-indigo-500 to-violet-500',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: {
    opacity: 1,
    y: 0,
  },
};

export default function Dashboard() {
  const navigate = useNavigate();

  const { setPapers, papers } = useWorkspaceStore();

  const { data: fetchedPapers } = useQuery({
    queryKey: ['papers'],
    queryFn: getPapers,
  });

  useEffect(() => {
    if (fetchedPapers) {
      setPapers(fetchedPapers);
    }
  }, [fetchedPapers, setPapers]);

  return (
    <div className="space-y-10">

      {/* =========================
          Hero Section
      ========================== */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center py-12"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: 'spring',
            delay: 0.2,
          }}
          className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow-lg shadow-accent-primary/30"
        >
          <Brain className="w-10 h-10 text-white" />
        </motion.div>

        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          <span className="gradient-text">
            AI Research Assistant
          </span>
        </h1>

        <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
          Analyze, summarize, and synthesize research papers with the power of
          <span className="text-accent-primary font-semibold">
            {' '}Google Gemini AI
          </span>
        </p>

        <div className="flex items-center justify-center gap-4 mt-8">
          <Button
            onClick={() => navigate('/library')}
            icon={<Upload className="w-4 h-4" />}
            size="lg"
          >
            Upload Papers
          </Button>

          <Button
            variant="secondary"
            onClick={() => navigate('/workspace')}
            icon={<FlaskConical className="w-4 h-4" />}
            size="lg"
          >
            Open Workspace
          </Button>
        </div>
      </motion.div>

      {/* =========================
          Stats
          Gemini 1.5 Card Removed
      ========================== */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {[
          {
            label: 'Papers Uploaded',
            value: papers.length,
            icon: FileText,
            color: 'accent-primary',
          },
          {
            label: 'Ready for Analysis',
            value: papers.filter(
              (p) => p.status === 'ready'
            ).length,
            icon: Zap,
            color: 'accent-secondary',
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            variants={item}
            className="glass-card p-5 hover-lift cursor-default"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl bg-${stat.color}/10 flex items-center justify-center`}
              >
                <stat.icon
                  className={`w-6 h-6 text-${stat.color}`}
                />
              </div>

              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {stat.value}
                </p>

                <p className="text-xs text-text-secondary">
                  {stat.label}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* =========================
          Features Grid
      ========================== */}
      <div>
        <h2 className="text-xl font-bold text-text-primary mb-6">
          Powerful Features
        </h2>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {features.map((feat, i) => (
            <motion.div
              key={i}
              variants={item}
              whileHover={{
                y: -4,
                transition: {
                  duration: 0.2,
                },
              }}
              onClick={() => navigate('/workspace')}
              className="glass-card p-5 cursor-pointer group"
            >
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feat.color} bg-opacity-10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
              >
                <feat.icon className="w-5 h-5 text-white" />
              </div>

              <h3 className="text-sm font-semibold text-text-primary mb-1">
                {feat.title}
              </h3>

              <p className="text-xs text-text-secondary leading-relaxed">
                {feat.desc}
              </p>

              <div className="flex items-center gap-1 mt-3 text-accent-primary text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Open
                <ArrowRight className="w-3 h-3" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* =========================
          Recent Papers
      ========================== */}
      {papers.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text-primary">
              Recent Papers
            </h2>

            <button
              onClick={() => navigate('/library')}
              className="text-sm text-accent-primary hover:underline flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {papers.slice(0, 5).map((paper) => (
              <motion.div
                key={paper.id}
                initial={{
                  opacity: 0,
                  x: -10,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                className="glass-card p-4 flex items-center gap-3 hover-lift cursor-pointer"
                onClick={() => navigate('/workspace')}
              >
                <FileText className="w-5 h-5 text-accent-primary flex-shrink-0" />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {paper.original_name}
                  </p>

                  <p className="text-xs text-text-muted">
                    {paper.page_count} pages •{' '}
                    {new Date(
                      paper.upload_date
                    ).toLocaleDateString()}
                  </p>
                </div>

                <span
                  className={`
                    px-2 py-0.5 rounded-full text-xs
                    ${
                      paper.status === 'ready'
                        ? 'bg-success/10 text-success'
                        : paper.status === 'error'
                        ? 'bg-error/10 text-error'
                        : 'bg-warning/10 text-warning'
                    }
                  `}
                >
                  {paper.status}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}