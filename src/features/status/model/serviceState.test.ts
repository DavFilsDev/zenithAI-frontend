import { describe, expect, it } from 'vitest';
import { ApiError } from '../../../shared/api/apiError';
import { deriveServiceState } from './serviceState';

describe('deriveServiceState', () => {
  it('reports online only when the API and database are reachable', () => {
    expect(deriveServiceState({ status: 'ok', database: 'ok' }, null)).toBe('online');
  });

  it('treats a pending or unreachable request as a wake-up', () => {
    expect(deriveServiceState(undefined, undefined)).toBe('waking');
    expect(deriveServiceState(undefined, new ApiError('Network error', 0))).toBe('waking');
  });

  it('reports an unavailable service when the readiness probe fails', () => {
    expect(deriveServiceState({ status: 'error', database: 'error' }, null)).toBe('unavailable');
    expect(deriveServiceState(undefined, new ApiError('Database unreachable', 503))).toBe(
      'unavailable',
    );
  });
});
