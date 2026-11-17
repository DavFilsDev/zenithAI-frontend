import { ApiError } from '../../../shared/api/apiError';
import type { Health } from '../../../shared/api/types';

export type ServiceState = 'online' | 'waking' | 'unavailable';

export const deriveServiceState = (data: Health | undefined, error: unknown): ServiceState => {
  if (data) {
    return data.status === 'ok' && data.database === 'ok' ? 'online' : 'unavailable';
  }

  if (!error) {
    return 'waking';
  }

  if (error instanceof ApiError && error.status === 0) {
    return 'waking';
  }

  return 'unavailable';
};
