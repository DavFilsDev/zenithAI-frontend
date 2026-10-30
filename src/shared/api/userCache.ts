import type { User } from './types';

const USER_KEY = 'authUser';

const isUser = (value: unknown): value is User => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === 'number' &&
    typeof candidate.email === 'string' &&
    typeof candidate.username === 'string'
  );
};

export const userCache = {
  read(): User | null {
    const raw = localStorage.getItem(USER_KEY);

    if (!raw) {
      return null;
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(raw);
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }

    if (isUser(parsed)) {
      return parsed;
    }

    localStorage.removeItem(USER_KEY);
    return null;
  },

  write(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clear(): void {
    localStorage.removeItem(USER_KEY);
  },
};
