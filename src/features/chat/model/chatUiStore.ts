import { create } from 'zustand';

interface ChatUiState {
  isDesktopSidebarExpanded: boolean;
  isMobileDrawerOpen: boolean;
  draft: string;
  conversationPage: number;
  toggleDesktopSidebar: () => void;
  openMobileDrawer: () => void;
  closeMobileDrawer: () => void;
  setDraft: (draft: string) => void;
  setConversationPage: (page: number) => void;
}

export const useChatUiStore = create<ChatUiState>((set) => ({
  isDesktopSidebarExpanded: true,
  isMobileDrawerOpen: false,
  draft: '',
  conversationPage: 1,
  toggleDesktopSidebar: () =>
    set((state) => ({ isDesktopSidebarExpanded: !state.isDesktopSidebarExpanded })),
  openMobileDrawer: () => set({ isMobileDrawerOpen: true }),
  closeMobileDrawer: () => set({ isMobileDrawerOpen: false }),
  setDraft: (draft) => set({ draft }),
  setConversationPage: (conversationPage) => set({ conversationPage }),
}));
