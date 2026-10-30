import type { components } from './api.generated';

export type User = components['schemas']['User'];
export type UpdateProfilePayload = components['schemas']['PatchedUserRequest'];
export type LoginCredentials = components['schemas']['TokenObtainPairRequest'];
export type RegisterCredentials = components['schemas']['RegisterRequest'];

export interface LoginResponse {
  access: string;
  refresh: string;
  user_id: number;
  email: string;
  username: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}
