import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { authApi } from './authApi';
import { ApiError } from '../../../shared/api/apiError';
import { tokenManager } from '../../../shared/api/tokenManager';
import { userCache } from '../../../shared/api/userCache';
import { server } from '../../../test/msw/node';

const baseUrl = 'http://localhost:8000/api/v1';

const user = {
  id: 1,
  email: 'ada@example.com',
  username: 'ada',
};

describe('authApi', () => {
  it('logs in, caches the user and stores tokens', async () => {
    server.use(
      http.post(`${baseUrl}/auth/token/`, () =>
        HttpResponse.json({
          access: 'access-token',
          refresh: 'refresh-token',
          user_id: 1,
          email: 'ada@example.com',
          username: 'ada',
        }),
      ),
    );

    await expect(
      authApi.login({ email: 'ada@example.com', password: 'secret123' }),
    ).resolves.toEqual({
      access: 'access-token',
      refresh: 'refresh-token',
      user,
    });

    expect(tokenManager.getAccessToken()).toBe('access-token');
    expect(tokenManager.getRefreshToken()).toBe('refresh-token');
    expect(userCache.read()).toEqual(user);
  });

  it('rejects a login response without tokens', async () => {
    server.use(http.post(`${baseUrl}/auth/token/`, () => HttpResponse.json({})));

    await expect(
      authApi.login({ email: 'ada@example.com', password: 'secret123' }),
    ).rejects.toMatchObject({
      code: 'unknown_error',
      message: 'Invalid response from server',
    });
  });

  it('registers, loads and updates a profile', async () => {
    server.use(
      http.post(`${baseUrl}/auth/register/`, () => HttpResponse.json(user, { status: 201 })),
      http.get(`${baseUrl}/auth/profile/`, () => HttpResponse.json(user)),
      http.patch(`${baseUrl}/auth/profile/`, () =>
        HttpResponse.json({ ...user, username: 'grace' }),
      ),
    );

    await expect(
      authApi.register({
        email: 'ada@example.com',
        username: 'ada',
        password: 'secret123',
        password2: 'secret123',
      }),
    ).resolves.toEqual(user);
    await expect(authApi.getProfile()).resolves.toEqual(user);
    await expect(authApi.updateProfile({ username: 'grace' })).resolves.toEqual({
      ...user,
      username: 'grace',
    });
  });

  it('rethrows API errors for profile operations', async () => {
    server.use(
      http.get(`${baseUrl}/auth/profile/`, () =>
        HttpResponse.json(
          { error: { code: 'not_found', message: 'Profile missing.' } },
          { status: 404 },
        ),
      ),
    );

    await expect(authApi.getProfile()).rejects.toBeInstanceOf(ApiError);
    await expect(authApi.getProfile()).rejects.toMatchObject({
      status: 404,
      code: 'not_found',
    });
  });

  it('clears local state without a refresh token', async () => {
    localStorage.setItem('accessToken', 'access-token');
    userCache.write(user);

    await authApi.logout();

    expect(tokenManager.getAccessToken()).toBeNull();
    expect(tokenManager.getRefreshToken()).toBeNull();
    expect(userCache.read()).toBeNull();
  });

  it('clears local state even when the logout request fails', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    tokenManager.setTokens('access-token', 'refresh-token');
    userCache.write(user);
    server.use(
      http.post(`${baseUrl}/auth/logout/`, () =>
        HttpResponse.json(
          { error: { code: 'server_error', message: 'Logout failed.' } },
          { status: 500 },
        ),
      ),
    );

    await expect(authApi.logout()).resolves.toBeUndefined();

    expect(tokenManager.getAccessToken()).toBeNull();
    expect(userCache.read()).toBeNull();
    expect(log).toHaveBeenCalled();
  });
});
