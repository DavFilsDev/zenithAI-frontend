import api from '../../../shared/api/apiClient';
import { tokenManager } from '../../../shared/api/tokenManager';
import { userCache } from '../../../shared/api/userCache';
import { ApiError } from '../../../shared/api/apiError';
import { logError } from '../../../shared/lib/logger';
import type {
  AuthResponse,
  LoginCredentials,
  LoginResponse,
  RegisterCredentials,
  UpdateProfilePayload,
  User,
} from '../../../shared/api/types';

export const authApi = {
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

      return { access, refresh, user };
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

  async logout(): Promise<void> {
    const refresh = tokenManager.getRefreshToken();
    tokenManager.clearTokens();
    userCache.clear();

    if (!refresh) {
      return;
    }

    try {
      await api.post('/auth/logout/', { refresh });
    } catch (error) {
      logError('logout', error);
    }
  },
};
