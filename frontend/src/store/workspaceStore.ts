import { create } from 'zustand';
import type { Paper, ChatMessage } from '../types';

interface WorkspaceState {
  papers: Paper[];
  selectedPaperIds: string[];
  chatHistory: ChatMessage[];
  activeModule: string;
  sidebarCollapsed: boolean;

  setPapers: (papers: Paper[]) => void;
  addPaper: (paper: Paper) => void;
  removePaper: (id: string) => void;
  selectPaper: (id: string) => void;
  deselectPaper: (id: string) => void;
  togglePaper: (id: string) => void;
  clearSelection: () => void;
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;
  setActiveModule: (module: string) => void;
  toggleSidebar: () => void;
}

const useWorkspaceStore = create<WorkspaceState>((set) => ({
  papers: [],
  selectedPaperIds: [],
  chatHistory: [],
  activeModule: 'summary',
  sidebarCollapsed: false,

  setPapers: (papers) => set({ papers }),

  addPaper: (paper) =>
    set((state) => ({ papers: [paper, ...state.papers] })),

  removePaper: (id) =>
    set((state) => ({
      papers: state.papers.filter((p) => p.id !== id),
      selectedPaperIds: state.selectedPaperIds.filter((pid) => pid !== id),
    })),

  selectPaper: (id) =>
    set((state) => ({
      selectedPaperIds: state.selectedPaperIds.includes(id)
        ? state.selectedPaperIds
        : [...state.selectedPaperIds, id],
    })),

  deselectPaper: (id) =>
    set((state) => ({
      selectedPaperIds: state.selectedPaperIds.filter((pid) => pid !== id),
    })),

  togglePaper: (id) =>
    set((state) => ({
      selectedPaperIds: state.selectedPaperIds.includes(id)
        ? state.selectedPaperIds.filter((pid) => pid !== id)
        : [...state.selectedPaperIds, id],
    })),

  clearSelection: () => set({ selectedPaperIds: [] }),

  addChatMessage: (message) =>
    set((state) => ({ chatHistory: [...state.chatHistory, message] })),

  clearChat: () => set({ chatHistory: [] }),

  setActiveModule: (module) => set({ activeModule: module }),

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));

export default useWorkspaceStore;
