import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import { authKeys } from '../api/queryKeys';
import { useSessionStore } from '../../../shared/auth/sessionStore';
import { tokenManager } from '../../../shared/api/tokenManager';
import { userCache } from '../../../shared/api/userCache';
import { ApiError } from '../../../shared/api/apiError';
import type { UpdateProfilePayload } from '../../../shared/api/types';

export const useProfileQuery = (enabled = true) => {
  const cachedUser = userCache.read();

  return useQuery({
    queryKey: authKeys.profile,
    queryFn: () => authApi.getProfile(),
    enabled: enabled && tokenManager.hasValidTokens(),
    initialData: cachedUser ?? undefined,
    initialDataUpdatedAt: 0,
    staleTime: 30_000,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && [401, 403, 404, 429].includes(error.status)) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => authApi.updateProfile(payload),
    onSuccess: (user) => {
      useSessionStore.getState().setUser(user);
      queryClient.setQueryData(authKeys.profile, user);
    },
  });
};
