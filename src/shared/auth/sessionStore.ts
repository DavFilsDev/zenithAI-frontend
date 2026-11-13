import { create } from 'zustand';
import { tokenManager } from '../api/tokenManager';
import { userCache } from '../api/userCache';
import type { User } from '../api/types';

export type SessionStatus = 'loading' | 'authenticated' | 'anonymous';

interface SessionState {
  user: User | null;
  status: SessionStatus;
  setUser: (user: User | null) => void;
  setStatus: (status: SessionStatus) => void;
  clear: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: userCache.read(),
  status: tokenManager.hasValidTokens() ? 'loading' : 'anonymous',
  setUser: (user) => {
    if (user) {
      userCache.write(user);
    }

    set({ user, status: user ? 'authenticated' : 'anonymous' });
  },
  setStatus: (status) => set({ status }),
  clear: () => {
    tokenManager.clearTokens();
    userCache.clear();
    set({ user: null, status: 'anonymous' });
  },
}));
