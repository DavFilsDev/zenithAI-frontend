export interface User {
  id: number;
  email: string;
  username: string;
}

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

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  username: string;
  password2: string;
}
