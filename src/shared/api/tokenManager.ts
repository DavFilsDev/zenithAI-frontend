const REFRESH_TOKEN_KEY = 'refreshToken';

let accessToken: string | null = null;

export const tokenManager = {
  getAccessToken(): string | null {
    return accessToken;
  },

  getRefreshToken(): string | null {
    return sessionStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens(access: string, refresh: string): void {
    accessToken = access;
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  },

  clearTokens(): void {
    accessToken = null;
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  hasRefreshToken(): boolean {
    return Boolean(this.getRefreshToken());
  },
};
