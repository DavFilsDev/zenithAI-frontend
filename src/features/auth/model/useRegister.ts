import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/authApi';

export const useRegister = () => {
  return useMutation({
    mutationFn: authApi.register,
  });
};
