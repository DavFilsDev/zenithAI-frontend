import { describe, expect, it, vi } from 'vitest';
import { tokenManager } from './tokenManager';

describe('tokenManager', () => {
  it('keeps the access token in memory and the refresh token in sessionStorage', () => {
    tokenManager.setTokens('access-token', 'refresh-token');

    expect(tokenManager.getAccessToken()).toBe('access-token');
    expect(tokenManager.getRefreshToken()).toBe('refresh-token');
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(sessionStorage.getItem('refreshToken')).toBe('refresh-token');
  });

  it('restores the session marker after a module reload without restoring the access token', async () => {
    tokenManager.setTokens('access-token', 'refresh-token');
    vi.resetModules();

    const reloaded = await import('./tokenManager');

    expect(reloaded.tokenManager.getAccessToken()).toBeNull();
    expect(reloaded.tokenManager.getRefreshToken()).toBe('refresh-token');
    expect(reloaded.tokenManager.hasRefreshToken()).toBe(true);
  });

  it('clears both tokens', () => {
    tokenManager.setTokens('access-token', 'refresh-token');
    tokenManager.clearTokens();

    expect(tokenManager.getAccessToken()).toBeNull();
    expect(tokenManager.getRefreshToken()).toBeNull();
    expect(tokenManager.hasRefreshToken()).toBe(false);
  });
});
