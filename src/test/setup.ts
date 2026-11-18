import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { server } from './msw/node';
import api from '../shared/api/apiClient';
import { tokenManager } from '../shared/api/tokenManager';
import { useSessionStore } from '../shared/auth/sessionStore';
import { useChatUiStore } from '../features/chat/model/chatUiStore';

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === '(min-width: 1024px)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  Element.prototype.scrollIntoView = vi.fn();
  api.defaults.adapter = 'fetch';
  server.listen({ onUnhandledFrame: 'error' });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
  localStorage.clear();
  sessionStorage.clear();
  tokenManager.clearTokens();
  useSessionStore.setState({ user: null, status: 'anonymous' });
  useChatUiStore.setState({
    isDesktopSidebarExpanded: true,
    isMobileDrawerOpen: false,
    draft: '',
    conversationPage: 1,
  });
});

afterAll(() => {
  server.close();
});
