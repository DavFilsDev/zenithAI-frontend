import axios from 'axios';

export type ApiErrorDetails = Record<string, unknown>;

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: ApiErrorDetails | null;
}

interface ApiErrorEnvelope {
  error: ApiErrorPayload;
}

interface ApiErrorOptions {
  code?: string;
  details?: ApiErrorDetails | null;
  data?: unknown;
}

const fallbackCodes: Record<number, string> = {
  400: 'validation_error',
  401: 'unauthorized',
  403: 'forbidden',
  404: 'not_found',
  429: 'rate_limited',
  500: 'server_error',
  503: 'llm_unavailable',
};

const fallbackMessages: Record<number, string> = {
  0: 'Unable to reach the server. Check your connection and try again.',
  400: 'The request could not be processed.',
  401: 'You are not authorized to perform this action.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  429: 'Too many requests. Please try again later.',
  500: 'The server encountered an error. Please try again.',
  503: 'The service is temporarily unavailable. Please try again later.',
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isApiErrorEnvelope = (value: unknown): value is ApiErrorEnvelope => {
  if (!isRecord(value) || !isRecord(value.error)) {
    return false;
  }
  return typeof value.error.code === 'string' && typeof value.error.message === 'string';
};

const envelopeFrom = (body: unknown): ApiErrorPayload | undefined => {
  if (isApiErrorEnvelope(body)) {
    return body.error;
  }
  return undefined;
};

const codeFor = (status: number): string =>
  fallbackCodes[status] ?? (status === 0 ? 'network_error' : 'unknown_error');

const messageFrom = (status: number, body: unknown, axiosMessage?: string): string => {
  if (isRecord(body)) {
    if (typeof body.detail === 'string' && body.detail) {
      return body.detail;
    }
    if (typeof body.message === 'string' && body.message) {
      return body.message;
    }
  }

  if (typeof body === 'string' && body && !body.trimStart().startsWith('<')) {
    return body;
  }

  return fallbackMessages[status] ?? axiosMessage ?? 'An error occurred';
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: ApiErrorDetails | null;
  readonly data: unknown;

  constructor(message: string, status: number, options: ApiErrorOptions = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = options.code ?? codeFor(status);
    this.details = options.details ?? null;
    this.data = options.data;
  }

  static fromAxiosError(error: unknown): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    if (!axios.isAxiosError(error)) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      return new ApiError(message, 0, { code: 'unknown_error', data: error });
    }

    const status = error.response?.status ?? 0;
    const body = error.response?.data;
    const envelope = envelopeFrom(body);
    const details = envelope && isRecord(envelope.details) ? envelope.details : null;

    return new ApiError(envelope?.message ?? messageFrom(status, body, error.message), status, {
      code: envelope?.code ?? codeFor(status),
      details,
      data: body,
    });
  }

  getFieldErrors(): Record<string, string[]> {
    if (!this.details) {
      return {};
    }

    const fieldErrors: Record<string, string[]> = {};

    for (const [field, value] of Object.entries(this.details)) {
      if (typeof value === 'string') {
        fieldErrors[field] = [value];
      } else if (Array.isArray(value)) {
        const messages = value.filter((item): item is string => typeof item === 'string');
        if (messages.length > 0) {
          fieldErrors[field] = messages;
        }
      }
    }

    return fieldErrors;
  }
}
