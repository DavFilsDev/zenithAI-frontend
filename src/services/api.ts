import axios from 'axios';
import { tokenManager } from './tokenManager';
import { refreshTokenService } from './refreshTokenService';
import { isAuthEndpoint } from '../types/auth';
import { ApiError } from './apiError';
import { env } from '../config/env';

const api = axios.create({
  baseURL: env.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

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
    
    if (isAuthEndpoint(originalRequest?.url)) {
      return Promise.reject(ApiError.fromAxiosError(error));
    }
    
    if (originalRequest?._retry) {
      tokenManager.clearTokens();
      window.location.href = '/login';
      return Promise.reject(ApiError.fromAxiosError(error));
    }
    
    if (error.response?.status === 401 && tokenManager.hasValidTokens()) {
      originalRequest._retry = true;
      
      try {
        await refreshTokenService.refresh();
        return api(originalRequest);
      } catch (refreshError) {
        tokenManager.clearTokens();
        window.location.href = '/login';
        return Promise.reject(ApiError.fromAxiosError(refreshError));
      }
    }
    
    return Promise.reject(ApiError.fromAxiosError(error));
  }
);

export default api;