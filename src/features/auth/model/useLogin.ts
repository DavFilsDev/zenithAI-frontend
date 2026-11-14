import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { authKeys } from '../api/queryKeys';
import { useSessionStore } from '../../../shared/auth/sessionStore';
import { notify } from '../../../shared/ui/notify';
import type { LoginCredentials } from '../../../shared/api/types';

export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: ({ user }) => {
      useSessionStore.getState().setUser(user);
      queryClient.setQueryData(authKeys.profile, user);
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
      notify.success(`Welcome back, ${user.username || user.email}!`);
      void navigate('/chat', { replace: true });
    },
  });
};
