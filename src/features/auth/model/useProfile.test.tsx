import { act, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { useProfileQuery, useUpdateProfile } from './useProfile';
import { authKeys } from '../api/queryKeys';
import { useSessionStore } from '../../../shared/auth/sessionStore';
import { tokenManager } from '../../../shared/api/tokenManager';
import { userCache } from '../../../shared/api/userCache';
import { server } from '../../../test/msw/node';
import { renderHookWithProviders } from '../../../test/utils';

const baseUrl = 'http://localhost:8000/api/v1';
const profileUrl = `${baseUrl}/auth/profile/`;

const cachedUser = {
  id: 1,
  email: 'cached@example.com',
  username: 'cached',
};

const freshUser = {
  id: 1,
  email: 'fresh@example.com',
  username: 'fresh',
};

describe('useProfileQuery', () => {
  it('stays idle when tokens are unavailable', async () => {
    const { result } = renderHookWithProviders(() => useProfileQuery());

    await waitFor(() => {
      expect(result.current.fetchStatus).toBe('idle');
    });
    expect(result.current.data).toBeUndefined();
  });

  it('hydrates from the cached user and refreshes the profile', async () => {
    tokenManager.setTokens('access-token', 'refresh-token');
    userCache.write(cachedUser);
    server.use(http.get(profileUrl, () => HttpResponse.json(freshUser)));

    const { result } = renderHookWithProviders(() => useProfileQuery());

    expect(result.current.data).toEqual(cachedUser);
    await waitFor(() => {
      expect(result.current.data).toEqual(freshUser);
    });
  });

  it('does not retry unauthorized profile requests', async () => {
    tokenManager.setTokens('access-token', 'refresh-token');
    server.use(
      http.get(profileUrl, () =>
        HttpResponse.json(
          { error: { code: 'unauthorized', message: 'Session expired.' } },
          { status: 401 },
        ),
      ),
    );

    const { result } = renderHookWithProviders(() => useProfileQuery());

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.failureCount).toBe(1);
  });
});

describe('useUpdateProfile', () => {
  it('stores the updated profile in the session and query cache', async () => {
    const updatedUser = { ...freshUser, username: 'updated' };
    server.use(http.patch(profileUrl, () => HttpResponse.json(updatedUser)));

    const { result, queryClient } = renderHookWithProviders(() => useUpdateProfile());

    await act(async () => {
      await result.current.mutateAsync({ username: 'updated' });
    });

    expect(useSessionStore.getState().user).toEqual(updatedUser);
    expect(queryClient.getQueryData(authKeys.profile)).toEqual(updatedUser);
  });
});
