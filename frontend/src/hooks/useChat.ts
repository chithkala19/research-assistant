import { useState } from 'react';
import { sendChatMessage } from '../services/api';
import useWorkspaceStore from '../store/workspaceStore';
import toast from 'react-hot-toast';
import type { ChatMessage } from '../types';

export function useChat() {
  const [isLoading, setIsLoading] = useState(false);
  const { selectedPaperIds, chatHistory, addChatMessage } = useWorkspaceStore();

  const send = async (message: string) => {
    if (!message.trim()) return;
    if (selectedPaperIds.length === 0) {
      toast.error('Please select at least one paper first');
      return;
    }

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      paper_ids: selectedPaperIds,
    };
    addChatMessage(userMsg);
    setIsLoading(true);

    try {
      const history = chatHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      history.push({ role: 'user', content: message });

      const response = await sendChatMessage(selectedPaperIds, message, history);

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.answer,
        timestamp: new Date().toISOString(),
      };
      addChatMessage(assistantMsg);
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Failed to get response';
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return { send, isLoading, chatHistory };
}

export default useChat;
