import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { authKeys } from '../api/queryKeys';
import { useSessionStore } from '../../../shared/auth/sessionStore';
import { notify } from '../../../shared/ui/notify';

export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ user }) => {
      useSessionStore.getState().setUser(user);
      queryClient.setQueryData(authKeys.profile, user);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      notify.success(`Welcome back, ${user.username || user.email}!`);
      navigate('/chat', { replace: true });
    },
  });
};
