import type { ApiError } from '../services/apiError';

export const logApiError = (error: ApiError): void => {
  if (!import.meta.env.DEV) return;
  console.error(`[api] ${error.status} ${error.code}: ${error.message}`);
};

export const logError = (context: string, error: unknown): void => {
  if (!import.meta.env.DEV) return;
  console.error(`[${context}]`, error);
};
