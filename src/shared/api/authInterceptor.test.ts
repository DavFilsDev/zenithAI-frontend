import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { endSession, refreshAccessToken, shouldSkipRefresh } from './authInterceptor';
import { tokenManager } from './tokenManager';
import { useSessionStore } from '../auth/sessionStore';
import { server } from '../../test/msw/node';

const refreshUrl = 'http://localhost:8000/api/v1/auth/token/refresh/';

describe('shouldSkipRefresh', () => {
  it('skips auth endpoints and allows API endpoints', () => {
    expect(shouldSkipRefresh('/auth/token/')).toBe(true);
    expect(shouldSkipRefresh('/auth/register/')).toBe(true);
    expect(shouldSkipRefresh('/auth/profile/')).toBe(true);
    expect(shouldSkipRefresh('/auth/logout/')).toBe(true);
    expect(shouldSkipRefresh('/chat/conversations/')).toBe(false);
    expect(shouldSkipRefresh()).toBe(false);
  });
});

describe('refreshAccessToken', () => {
  it('refreshes tokens once for concurrent callers', async () => {
    tokenManager.setTokens('old-access', 'old-refresh');
    let calls = 0;
    server.use(
      http.post(refreshUrl, () => {
        calls += 1;
        return HttpResponse.json({ access: 'new-access', refresh: 'new-refresh' });
      }),
    );

    const first = refreshAccessToken();
    const second = refreshAccessToken();

    expect(first).toBe(second);
    await expect(first).resolves.toBe('new-access');
    expect(calls).toBe(1);
    expect(tokenManager.getAccessToken()).toBe('new-access');
    expect(tokenManager.getRefreshToken()).toBe('new-refresh');
  });

  it('keeps the existing refresh token when the server omits one', async () => {
    tokenManager.setTokens('old-access', 'old-refresh');
    server.use(http.post(refreshUrl, () => HttpResponse.json({ access: 'new-access' })));

    await expect(refreshAccessToken()).resolves.toBe('new-access');
    expect(tokenManager.getRefreshToken()).toBe('old-refresh');
  });

  it('rejects when no refresh token is available', async () => {
    await expect(refreshAccessToken()).rejects.toMatchObject({
      status: 401,
      code: 'unauthorized',
    });
  });

  it('wraps network failures', async () => {
    tokenManager.setTokens('old-access', 'old-refresh');
    server.use(http.post(refreshUrl, () => HttpResponse.error()));

    await expect(refreshAccessToken()).rejects.toMatchObject({
      status: 0,
      code: 'network_error',
    });
  });

  it('uses the response envelope for rejected refreshes', async () => {
    tokenManager.setTokens('old-access', 'old-refresh');
    server.use(
      http.post(refreshUrl, () =>
        HttpResponse.json(
          { error: { code: 'token_not_valid', message: 'Refresh expired.' } },
          { status: 401 },
        ),
      ),
    );

    await expect(refreshAccessToken()).rejects.toMatchObject({
      status: 401,
      code: 'token_not_valid',
      message: 'Refresh expired.',
    });
  });

  it('rejects invalid token responses', async () => {
    tokenManager.setTokens('old-access', 'old-refresh');
    server.use(http.post(refreshUrl, () => HttpResponse.json({ refresh: 'new-refresh' })));

    await expect(refreshAccessToken()).rejects.toMatchObject({
      status: 0,
      code: 'invalid_response',
    });
  });
});

describe('endSession', () => {
  it('clears the session and ignores repeated redirects', () => {
    useSessionStore.getState().setUser({
      id: 1,
      email: 'ada@example.com',
      username: 'ada',
    });
    tokenManager.setTokens('access-token', 'refresh-token');

    endSession();
    endSession();

    expect(useSessionStore.getState().user).toBeNull();
    expect(useSessionStore.getState().status).toBe('anonymous');
    expect(tokenManager.getAccessToken()).toBeNull();
  });
});
