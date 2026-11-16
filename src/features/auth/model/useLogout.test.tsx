import { act, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { useLogout } from './useLogout';
import { useSessionStore } from '../../../shared/auth/sessionStore';
import { tokenManager } from '../../../shared/api/tokenManager';
import { server } from '../../../test/msw/node';
import { renderHookWithProviders } from '../../../test/utils';

describe('useLogout', () => {
  it('clears the session and tokens', async () => {
    useSessionStore.getState().setUser({
      id: 1,
      email: 'ada@example.com',
      username: 'ada',
    });
    tokenManager.setTokens('access-token', 'refresh-token');
    server.use(
      http.post(
        'http://localhost:8000/api/v1/auth/logout/',
        () => new HttpResponse(null, { status: 204 }),
      ),
    );

    const { result } = renderHookWithProviders(() => useLogout());

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => {
      expect(useSessionStore.getState().status).toBe('anonymous');
    });

    expect(useSessionStore.getState().user).toBeNull();
    expect(tokenManager.getAccessToken()).toBeNull();
    expect(tokenManager.getRefreshToken()).toBeNull();
  });
});
