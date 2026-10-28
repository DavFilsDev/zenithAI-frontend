import axios from 'axios';
import { tokenManager } from './tokenManager';
import { refreshTokenService } from './refreshTokenService';
import { shouldSkipRefresh } from '../types/auth';
import { ApiError } from './apiError';
import { logApiError } from '../lib/logger';
import { env } from '../config/env';

const api = axios.create({
  baseURL: env.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

let isRedirecting = false;

const endSession = (): void => {
  tokenManager.clearTokens();

  if (isRedirecting) {
    return;
  }

  isRedirecting = true;
  window.location.href = '/login';
};

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
  (error) => {
    return reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (shouldSkipRefresh(originalRequest?.url)) {
      return reject(error);
    }
    
    if (originalRequest?._retry) {
      if (error.response?.status === 401) {
        endSession();
      }
      return reject(error);
    }
    
    if (error.response?.status === 401 && tokenManager.hasValidTokens()) {
      originalRequest._retry = true;
      
      try {
        await refreshTokenService.refresh();
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