import api from './api';
import { tokenManager } from './tokenManager';
import { ApiError } from './apiError';
import type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  LoginResponse,
  User,
} from '../types/user';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<LoginResponse>('/auth/token/', credentials);
      const { access, refresh, user_id, email, username } = response.data;

      if (!access || !refresh) {
        throw new Error('Invalid response from server');
      }

      tokenManager.setTokens(access, refresh);

      return {
        access,
        refresh,
        user: { id: user_id, email, username },
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.fromAxiosError(error);
    }
  },

  async register(credentials: RegisterCredentials): Promise<User> {
    try {
      const response = await api.post<User>('/auth/register/', credentials);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.fromAxiosError(error);
    }
  },

  async getProfile(): Promise<User> {
    try {
      const response = await api.get<User>('/auth/profile/');
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.fromAxiosError(error);
    }
  },

  logout(): void {
    tokenManager.clearTokens();
  },
};
