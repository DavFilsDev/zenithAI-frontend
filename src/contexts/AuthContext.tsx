import React, { createContext, useState, useEffect, useContext } from 'react';
import type { User, LoginCredentials, RegisterCredentials } from '../types/user';
import { authService } from '../services/auth';
import { tokenManager } from '../services/tokenManager';
import { userCache } from '../services/userCache';
import { ApiError } from '../services/apiError';

interface AuthContextType {
  user: User | null;
  hasSession: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (credentials: RegisterCredentials) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() =>
    tokenManager.hasValidTokens() ? userCache.read() : null
  );

  const [hasSession, setHasSession] = useState(() => tokenManager.hasValidTokens());

  const [isLoading, setIsLoading] = useState(() => tokenManager.hasValidTokens());

  useEffect(() => {
    if (!tokenManager.hasValidTokens()) {
      userCache.clear();
      return;
    }

    authService.getProfile()
      .then((userData) => {
        setUser(userData);
        userCache.write(userData);
      })
      .catch((error: unknown) => {
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          authService.logout();
          setUser(null);
          setHasSession(false);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    setUser(response.user);
    setHasSession(true);
    return response.user;
  };

  const register = async (credentials: RegisterCredentials) => {
    return authService.register(credentials);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setHasSession(false);
  };

  return (
    <AuthContext.Provider value={{ user, hasSession, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
