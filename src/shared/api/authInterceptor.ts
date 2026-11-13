import { env } from './env';
import { tokenManager } from './tokenManager';
import { ApiError } from './apiError';
import { useSessionStore } from '../auth/sessionStore';

const NO_REFRESH_ENDPOINTS = ['/auth/token/', '/auth/register/', '/auth/profile/', '/auth/logout/'];

export const shouldSkipRefresh = (url: string = ''): boolean =>
  NO_REFRESH_ENDPOINTS.some((endpoint) => url.includes(endpoint));

const requestNewAccessToken = async (): Promise<string> => {
  const refresh = tokenManager.getRefreshToken();

  if (!refresh) {
    throw new ApiError('Your session has expired. Please sign in again.', 401, {
      code: 'unauthorized',
    });
  }

  let response: Response;

  try {
    response = await fetch(`${env.apiUrl.replace(/\/$/, '')}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
  } catch (error) {
    throw new ApiError('Unable to reach the server. Check your connection and try again.', 0, {
      code: 'network_error',
      data: error,
    });
  }

  if (!response.ok) {
    throw await ApiError.fromResponse(response);
  }

  const data = (await response.json()) as { access?: string; refresh?: string };

  if (!data.access) {
    throw new ApiError('The server returned an invalid token response.', 0, {
      code: 'invalid_response',
    });
  }

  tokenManager.setTokens(data.access, data.refresh ?? refresh);

  return data.access;
};

let refreshPromise: Promise<string> | null = null;

export const refreshAccessToken = (): Promise<string> => {
  if (!refreshPromise) {
    refreshPromise = requestNewAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

let isRedirecting = false;

export const endSession = (): void => {
  useSessionStore.getState().clear();

  if (isRedirecting) {
    return;
  }

  isRedirecting = true;
  window.location.href = '/login';
};
