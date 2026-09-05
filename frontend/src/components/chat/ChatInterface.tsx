import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip } from 'lucide-react';
import useWorkspaceStore from '../../store/workspaceStore';
import { useChat } from '../../hooks/useChat';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

export default function ChatInterface() {
  const [input, setInput] = useState('');
  const { send, isLoading, chatHistory } = useChat();
  const selectedPaperIds = useWorkspaceStore((s) => s.selectedPaperIds);
  const papers = useWorkspaceStore((s) => s.papers);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    send(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectedPapers = papers.filter((p) => selectedPaperIds.includes(p.id));

  if (selectedPaperIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-20 h-20 rounded-2xl bg-accent-primary/10 flex items-center justify-center mb-4">
          <Paperclip className="w-10 h-10 text-accent-primary" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">No Papers Selected</h3>
        <p className="text-sm text-text-secondary max-w-sm">
          Select one or more papers from the sidebar to start asking questions about them.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Selected papers bar */}
      <div className="flex items-center gap-2 p-3 border-b border-border-subtle bg-bg-surface/50">
        <span className="text-xs text-text-muted">Chatting with:</span>
        <div className="flex flex-wrap gap-1">
          {selectedPapers.map((p) => (
            <span
              key={p.id}
              className="px-2 py-0.5 rounded-md bg-accent-primary/10 text-accent-primary text-xs"
            >
              {p.original_name.length > 25
                ? p.original_name.slice(0, 25) + '...'
                : p.original_name}
            </span>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full text-center"
          >
            <p className="text-text-secondary">
              Ask anything about your selected papers...
            </p>
          </motion.div>
        )}

        <AnimatePresence>
          {chatHistory.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </AnimatePresence>

        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border-subtle bg-bg-surface/50">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your papers..."
              rows={1}
              className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-3 pr-12 text-sm text-text-primary placeholder-text-muted resize-none focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/20 transition-all"
              style={{ minHeight: '44px', maxHeight: '120px' }}
              onInput={(e) => {
                const t = e.currentTarget;
                t.style.height = '44px';
                t.style.height = t.scrollHeight + 'px';
              }}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-3 rounded-xl bg-accent-primary hover:bg-blue-600 text-white disabled:opacity-40 disabled:hover:bg-accent-primary transition-all shadow-lg shadow-accent-primary/20"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
