import { describe, expect, it } from 'vitest';
import { userCache } from './userCache';

const user = {
  id: 1,
  email: 'ada@example.com',
  username: 'ada',
};

describe('userCache', () => {
  it('returns null when no user is cached', () => {
    expect(userCache.read()).toBeNull();
  });

  it('reads and clears a cached user', () => {
    userCache.write(user);

    expect(userCache.read()).toEqual(user);

    userCache.clear();

    expect(userCache.read()).toBeNull();
  });

  it('removes malformed JSON', () => {
    localStorage.setItem('authUser', '{invalid');

    expect(userCache.read()).toBeNull();
    expect(localStorage.getItem('authUser')).toBeNull();
  });

  it('removes cached values with the wrong shape', () => {
    localStorage.setItem('authUser', JSON.stringify({ id: '1', email: 'ada@example.com' }));

    expect(userCache.read()).toBeNull();
    expect(localStorage.getItem('authUser')).toBeNull();
  });
});
