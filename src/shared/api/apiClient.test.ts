import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import api from './apiClient';
import { tokenManager } from './tokenManager';
import { useSessionStore } from '../auth/sessionStore';
import { server } from '../../test/msw/node';

const baseUrl = 'http://localhost:8000/api/v1';
const conversationsUrl = `${baseUrl}/chat/conversations/`;
const refreshUrl = `${baseUrl}/auth/token/refresh/`;

const unauthorized = () =>
  HttpResponse.json(
    { error: { code: 'unauthorized', message: 'Session expired.' } },
    { status: 401 },
  );

describe('apiClient', () => {
  it('adds the access token to requests', async () => {
    let authorization: string | null = null;
    tokenManager.setTokens('access-token', 'refresh-token');
    server.use(
      http.get(conversationsUrl, ({ request }) => {
        authorization = request.headers.get('authorization');
        return HttpResponse.json({ results: [] });
      }),
    );

    await expect(api.get('/chat/conversations/')).resolves.toMatchObject({
      data: { results: [] },
    });
    expect(authorization).toBe('Bearer access-token');
  });

  it('refreshes and retries a request after a 401', async () => {
    const attempts: string[] = [];
    tokenManager.setTokens('old-access', 'old-refresh');
    server.use(
      http.get(conversationsUrl, ({ request }) => {
        attempts.push(request.headers.get('authorization') ?? '');
        return attempts.length === 1 ? unauthorized() : HttpResponse.json({ results: [] });
      }),
      http.post(refreshUrl, () =>
        HttpResponse.json({ access: 'new-access', refresh: 'new-refresh' }),
      ),
    );

    await expect(api.get('/chat/conversations/')).resolves.toMatchObject({
      data: { results: [] },
    });
    expect(attempts).toEqual(['Bearer old-access', 'Bearer new-access']);
    expect(tokenManager.getAccessToken()).toBe('new-access');
  });

  it('rejects a 401 without valid tokens', async () => {
    server.use(http.get(conversationsUrl, unauthorized));

    await expect(api.get('/chat/conversations/')).rejects.toMatchObject({
      status: 401,
      code: 'unauthorized',
    });
  });

  it('does not refresh auth endpoints', async () => {
    const refresh = vi.fn();
    tokenManager.setTokens('access-token', 'refresh-token');
    server.use(
      http.get(`${baseUrl}/auth/profile/`, unauthorized),
      http.post(refreshUrl, () => {
        refresh();
        return HttpResponse.json({ access: 'new-access' });
      }),
    );

    await expect(api.get('/auth/profile/')).rejects.toMatchObject({ status: 401 });
    expect(refresh).not.toHaveBeenCalled();
  });

  it('ends the session when a refresh is rejected', async () => {
    tokenManager.setTokens('access-token', 'refresh-token');
    server.use(
      http.get(conversationsUrl, unauthorized),
      http.post(refreshUrl, () =>
        HttpResponse.json(
          { error: { code: 'unauthorized', message: 'Refresh expired.' } },
          { status: 401 },
        ),
      ),
    );

    await expect(api.get('/chat/conversations/')).rejects.toMatchObject({
      status: 401,
      code: 'unauthorized',
    });
    expect(useSessionStore.getState().status).toBe('anonymous');
  });

  it('ends the session when a retried request is still unauthorized', async () => {
    tokenManager.setTokens('access-token', 'refresh-token');
    server.use(
      http.get(conversationsUrl, unauthorized),
      http.post(refreshUrl, () => HttpResponse.json({ access: 'new-access' })),
    );

    await expect(api.get('/chat/conversations/')).rejects.toMatchObject({ status: 401 });
    expect(useSessionStore.getState().user).toBeNull();
  });

  it('wraps network errors', async () => {
    tokenManager.setTokens('access-token', 'refresh-token');
    server.use(http.get(conversationsUrl, () => HttpResponse.error()));

    await expect(api.get('/chat/conversations/')).rejects.toMatchObject({
      status: 0,
      code: 'network_error',
    });
  });
});
