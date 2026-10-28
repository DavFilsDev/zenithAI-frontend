import axios from 'axios';
import { tokenManager } from './tokenManager';
import { env } from '../config/env';

let refreshPromise: Promise<string> | null = null;

const performRefresh = async (): Promise<string> => {
  const refreshToken = tokenManager.getRefreshToken();

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await axios.post<{ access: string; refresh?: string }>(
    `${env.apiUrl}/auth/token/refresh/`,
    { refresh: refreshToken }
  );

  if (!response.data?.access) {
    throw new Error('Invalid refresh response');
  }

  const newAccessToken = response.data.access;
  tokenManager.setTokens(newAccessToken, response.data.refresh ?? refreshToken);

  return newAccessToken;
};

export const refreshTokenService = {
  refresh(): Promise<string> {
    if (!refreshPromise) {
      refreshPromise = performRefresh().finally(() => {
        refreshPromise = null;
      });
    }

    return refreshPromise;
  },
};
