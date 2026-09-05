import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Database, Cpu, Code, ExternalLink, CheckCircle2, AlertTriangle } from 'lucide-react';
import { getStatus } from "../services/api";
import Badge from '../components/shared/Badge';

export default function Settings() {
  const { data: status, isLoading } = useQuery({
    queryKey: ['status'],
    queryFn: getStatus,
    refetchInterval: 30000,
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-text-primary mb-6">Settings</h2>

        {/* API Configuration */}
        <div className="glass-card p-6 mb-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-primary" />
            AI Configuration
          </h3>

          <div className="space-y-4">
            {/* Model Status */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-bg-elevated">
              <div className="flex items-center gap-3">
                <Cpu className="w-5 h-5 text-text-secondary" />
                <div>
                  <p className="text-sm font-medium text-text-primary">Language Model</p>
                  <p className="text-xs text-text-secondary">Gemini 1.5 Pro</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {status?.stub_mode ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    <Badge variant="warning">Stub Mode</Badge>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <Badge variant="success">Gemini 1.5 Pro Connected</Badge>
                  </>
                )}
              </div>
            </div>

            {/* Model Details */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-bg-elevated">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-text-secondary" />
                <div>
                  <p className="text-sm font-medium text-text-primary">Embeddings</p>
                  <p className="text-xs text-text-secondary">Google Generative AI (models/embedding-001)</p>
                </div>
              </div>
              <Badge variant={status?.stub_mode ? 'warning' : 'success'}>
                {status?.stub_mode ? 'Fake Embeddings' : 'Active'}
              </Badge>
            </div>

            {/* Vector Store */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-bg-elevated">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-text-secondary" />
                <div>
                  <p className="text-sm font-medium text-text-primary">Vector Store</p>
                  <p className="text-xs text-text-secondary">ChromaDB (Local)</p>
                </div>
              </div>
              <Badge variant="success">Active</Badge>
            </div>

            {status?.stub_mode && (
              <div className="p-4 rounded-xl bg-warning/5 border border-warning/20">
                <p className="text-sm text-warning font-medium mb-1">Stub Mode Active</p>
                <p className="text-xs text-text-secondary leading-relaxed">
                  The app is running with placeholder responses. To enable real AI responses:
                </p>
                <ol className="text-xs text-text-secondary mt-2 space-y-1 list-decimal list-inside">
                  <li>Get a free API key at <a href="https://ai.google.dev" target="_blank" rel="noopener noreferrer" className="text-accent-primary hover:underline">ai.google.dev</a></li>
                  <li>Set <code className="px-1 py-0.5 bg-bg-elevated rounded text-success font-mono">GEMINI_API_KEY</code> in <code className="px-1 py-0.5 bg-bg-elevated rounded text-success font-mono">backend/.env</code></li>
                  <li>Set <code className="px-1 py-0.5 bg-bg-elevated rounded text-success font-mono">GEMINI_STUB_MODE=false</code></li>
                  <li>Restart the backend server</li>
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* Application Info */}
        <div className="glass-card p-6 mb-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Code className="w-5 h-5 text-accent-primary" />
            Application Info
          </h3>

          <div className="space-y-3">
            {[
              { label: 'Version', value: '1.0.0' },
              { label: 'Frontend', value: 'React 18 + TypeScript + Tailwind CSS' },
              { label: 'Backend', value: 'Python 3.11 + FastAPI' },
              { label: 'AI Engine', value: 'Google Gemini 1.5 Pro' },
              { label: 'RAG Framework', value: 'LangChain + ChromaDB' },
              { label: 'Database', value: 'SQLite (SQLAlchemy)' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0">
                <span className="text-sm text-text-secondary">{item.label}</span>
                <span className="text-sm font-medium text-text-primary">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* About */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">About</h3>
          <p className="text-sm text-text-secondary leading-relaxed mb-4">
            AI-Powered Research Assistant is a full-stack application designed for students,
            researchers, and academicians to analyze, summarize, and synthesize research papers
            using Artificial Intelligence with RAG (Retrieval-Augmented Generation) architecture.
          </p>
          <div className="flex gap-3">
            <a
              href="https://ai.google.dev/gemini-api/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-accent-primary hover:underline"
            >
              Gemini API Docs <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
