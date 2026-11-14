import axios, { type InternalAxiosRequestConfig } from 'axios';
import { env } from './env';
import { tokenManager } from './tokenManager';
import { shouldSkipRefresh, refreshAccessToken, endSession } from './authInterceptor';
import { ApiError } from './apiError';
import { logApiError } from '../lib/logger';

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const api = axios.create({
  baseURL: env.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

const reject = (error: unknown): Promise<never> => {
  const apiError = ApiError.fromAxiosError(error);
  logApiError(apiError);
  return Promise.reject(apiError);
};

api.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return reject(error);
    }

    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (!originalRequest || shouldSkipRefresh(originalRequest.url)) {
      return reject(error);
    }

    if (originalRequest._retry) {
      if (error.response?.status === 401) {
        endSession();
      }
      return reject(error);
    }

    if (error.response?.status === 401 && tokenManager.hasValidTokens()) {
      originalRequest._retry = true;

      try {
        await refreshAccessToken();
        return api(originalRequest);
      } catch (refreshError) {
        const apiError = ApiError.fromAxiosError(refreshError);

        if (apiError.status === 401) {
          endSession();
        }

        logApiError(apiError);
        return Promise.reject(apiError);
      }
    }

    return reject(error);
  }
);

export default api;
