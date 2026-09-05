import { motion } from 'framer-motion';
import {
  FileText, BookOpen, Compass, Quote, Search,
  BarChart3, ShieldCheck, MessageSquare,
} from 'lucide-react';
import useWorkspaceStore from "../store/workspaceStore";

import SummaryPanel from '../components/modules/SummaryPanel';
import LiteratureSurvey from '../components/modules/LiteratureSurvey';
import DomainIdentifier from '../components/modules/DomainIdentifier';
import CitationBuilder from '../components/modules/CitationBuilder';
import RealTimeResearch from '../components/modules/RealTimeResearch';
import VisualizationPanel from '../components/modules/VisualizationPanel';
import ConsistencyChecker from '../components/modules/ConsistencyChecker';
import ChatInterface from '../components/chat/ChatInterface';

const modules = [
  { key: 'summary', label: 'Summary', icon: FileText },
  { key: 'literature', label: 'Literature', icon: BookOpen },
  { key: 'domain', label: 'Domain', icon: Compass },
  { key: 'citation', label: 'Citation', icon: Quote },
  { key: 'search', label: 'Search', icon: Search },
  { key: 'visualization', label: 'Charts', icon: BarChart3 },
  { key: 'consistency', label: 'Consistency', icon: ShieldCheck },
  { key: 'chat', label: 'Chat', icon: MessageSquare },
];

const moduleComponents: Record<string, React.ComponentType> = {
  summary: SummaryPanel,
  literature: LiteratureSurvey,
  domain: DomainIdentifier,
  citation: CitationBuilder,
  search: RealTimeResearch,
  visualization: VisualizationPanel,
  consistency: ConsistencyChecker,
  chat: ChatInterface,
};

export default function Workspace() {
  const { activeModule, setActiveModule } = useWorkspaceStore();
  const ActiveComponent = moduleComponents[activeModule] || SummaryPanel;

  return (
    <div className="flex gap-6 h-[calc(100vh-7rem)]">
      {/* Module Tabs */}
      <div className="flex flex-col gap-1.5 flex-shrink-0">
        {modules.map((mod) => {
          const isActive = activeModule === mod.key;
          return (
            <motion.button
              key={mod.key}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveModule(mod.key)}
              className={`
                flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 min-w-[140px] text-left
                ${isActive
                  ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/20'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                }
              `}
            >
              <mod.icon className="w-4 h-4 flex-shrink-0" />
              {mod.label}
            </motion.button>
          );
        })}
      </div>

      {/* Active Panel */}
      <motion.div
        key={activeModule}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 glass-card overflow-y-auto p-6 rounded-2xl min-w-0"
      >
        <ActiveComponent />
      </motion.div>
    </div>
  );
}
