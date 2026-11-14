import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import type { RegisterCredentials } from '../../../shared/api/types';

export const useRegister = () => {
  return useMutation({
    mutationFn: (credentials: RegisterCredentials) => authApi.register(credentials),
  });
};
