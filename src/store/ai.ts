import { atom } from 'jotai';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  errorLog?: string;
}

export const chatMessagesAtom = atom<ChatMessage[]>([]);
export const isAIResponseLoadingAtom = atom(false);

export const addChatMessageAtom = atom(
  null,
  (get, set, message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString() + Math.random().toString(36).substring(2),
      timestamp: new Date().toLocaleTimeString(),
    };
    set(chatMessagesAtom, (prev) => [...prev, newMessage]);
  }
);

export const clearChatMessagesAtom = atom(
  null,
  (get, set) => {
    set(chatMessagesAtom, []);
  }
);
