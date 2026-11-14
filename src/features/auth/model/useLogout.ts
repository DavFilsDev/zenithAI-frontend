import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useSessionStore } from '../../../shared/auth/sessionStore';
import { notify } from '../../../shared/ui/notify';

export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      const user = useSessionStore.getState().user;
      const name = user?.username || user?.email || 'User';

      useSessionStore.getState().clear();
      queryClient.clear();
      void navigate('/login', { replace: true });
      notify.success(`You are logged out successfully! See you soon ${name}!`);
    },
  });
};
