import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ExternalLink, BookOpen, Calendar, Users, Award } from 'lucide-react';
import { useAnalysis } from '../../hooks/useAnalysis';
import Button from '../shared/Button';
import Loader from '../shared/Loader';

export default function RealTimeResearch() {
  const [query, setQuery] = useState('');
  const { search } = useAnalysis();

  const handleSearch = () => {
    if (query.trim()) search.mutate({ query, limit: 10 });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-4">
        <label className="block text-sm font-medium text-text-secondary mb-2">Search Query</label>
        <div className="flex gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search for research papers..."
            className="flex-1 bg-bg-elevated border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary/50"
          />
          <Button
            onClick={handleSearch}
            loading={search.isPending}
            icon={<Search className="w-4 h-4" />}
          >
            Search
          </Button>
        </div>
      </div>

      {search.isPending && <Loader text="Searching Semantic Scholar..." className="py-8" />}

      <AnimatePresence>
        {search.data && Array.isArray(search.data) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <p className="text-sm text-text-secondary">
              Found {search.data.length} results
            </p>
            {search.data.map((result, i) => (
              <motion.div
                key={result.paperId || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-5 hover-lift"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-text-primary leading-snug mb-2">
                      {result.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted mb-3">
                      {result.year && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {result.year}
                        </span>
                      )}
                      {result.citationCount > 0 && (
                        <span className="flex items-center gap-1">
                          <Award className="w-3 h-3" /> {result.citationCount} citations
                        </span>
                      )}
                      {result.authors && result.authors.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {result.authors.slice(0, 3).join(', ')}
                          {result.authors.length > 3 && ` +${result.authors.length - 3}`}
                        </span>
                      )}
                    </div>

                    {result.abstract && (
                      <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed">
                        {result.abstract}
                      </p>
                    )}
                  </div>

                  {result.url && (
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-bg-elevated hover:bg-accent-primary/10 text-text-muted hover:text-accent-primary transition-all flex-shrink-0"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
