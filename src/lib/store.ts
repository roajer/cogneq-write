import { create } from 'zustand';

interface AuthState {
  user: any | null;
  setUser: (user: any | null) => void;
}

interface ChatState {
  messages: Message[];
  addMessage: (message: Message) => void;
  bookTitle: string;
  setBookTitle: (title: string) => void;
  outline: string[];
  setOutline: (outline: string[]) => void;
  currentSection: string;
  setCurrentSection: (section: string) => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  bookTitle: '',
  setBookTitle: (title) => set({ bookTitle: title }),
  outline: [],
  setOutline: (outline) => set({ outline }),
  currentSection: '',
  setCurrentSection: (section) => set({ currentSection: section }),
}));