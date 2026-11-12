import api from './api';
import { tokenManager } from './tokenManager';
import { userCache } from './userCache';
import { ApiError } from './apiError';
import type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  LoginResponse,
  UpdateProfilePayload,
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

      const user = { id: user_id, email, username };
      userCache.write(user);

      return {
        access,
        refresh,
        user,
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

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    try {
      const response = await api.patch<User>('/auth/profile/', payload);
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
    userCache.clear();
  },
};
