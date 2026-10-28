import axios from 'axios';
import { tokenManager } from './tokenManager';
import { refreshTokenService } from './refreshTokenService';
import { shouldSkipRefresh } from '../types/auth';
import { ApiError } from './apiError';
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

api.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken();
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(ApiError.fromAxiosError(error));
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (shouldSkipRefresh(originalRequest?.url)) {
      return Promise.reject(ApiError.fromAxiosError(error));
    }
    
    if (originalRequest?._retry) {
      if (error.response?.status === 401) {
        endSession();
      }
      return Promise.reject(ApiError.fromAxiosError(error));
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
        return Promise.reject(apiError);
      }
    }
    
    return Promise.reject(ApiError.fromAxiosError(error));
  }
);

export default api;