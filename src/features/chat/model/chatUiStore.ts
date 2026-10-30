import { create } from 'zustand';

interface ChatUiState {
  isSidebarOpen: boolean;
  draft: string;
  conversationPage: number;
  toggleSidebar: () => void;
  setDraft: (draft: string) => void;
  setConversationPage: (page: number) => void;
}

export const useChatUiStore = create<ChatUiState>((set) => ({
  isSidebarOpen: true,
  draft: '',
  conversationPage: 1,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setDraft: (draft) => set({ draft }),
  setConversationPage: (conversationPage) => set({ conversationPage }),
}));
