import { AxiosError, type AxiosResponse } from 'axios';
import { describe, expect, it } from 'vitest';
import { ApiError } from './apiError';

const axiosError = (data: unknown, status = 400, headers: Record<string, string> = {}) =>
  new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data,
    status,
    statusText: '',
    headers,
    config: { headers: {} },
  } as AxiosResponse);

describe('ApiError', () => {
  it('uses status defaults and explicit options', () => {
    expect(new ApiError('Bad request', 400)).toMatchObject({
      name: 'ApiError',
      message: 'Bad request',
      status: 400,
      code: 'validation_error',
      details: null,
      retryAfter: null,
    });

    expect(
      new ApiError('Custom', 418, {
        code: 'teapot',
        details: { field: ['message'] },
        data: { field: 'value' },
        retryAfter: 10,
      }),
    ).toMatchObject({
      code: 'teapot',
      details: { field: ['message'] },
      data: { field: 'value' },
      retryAfter: 10,
    });
  });

  it('passes existing API errors through', () => {
    const error = new ApiError('Existing', 500);
    expect(ApiError.fromAxiosError(error)).toBe(error);
  });

  it('wraps non-axios errors', () => {
    expect(ApiError.fromAxiosError(new Error('Boom'))).toMatchObject({
      message: 'Boom',
      status: 0,
      code: 'unknown_error',
    });
    expect(ApiError.fromAxiosError('unknown')).toMatchObject({
      message: 'An error occurred',
      status: 0,
      code: 'unknown_error',
    });
  });

  it('extracts envelopes, field details and retry headers', () => {
    const error = ApiError.fromAxiosError(
      axiosError(
        {
          error: {
            code: 'validation_error',
            message: 'Invalid profile.',
            details: { email: ['Already used'] },
          },
        },
        400,
        { 'retry-after': '3' },
      ),
    );

    expect(error).toMatchObject({
      message: 'Invalid profile.',
      code: 'validation_error',
      details: { email: ['Already used'] },
      retryAfter: 3,
    });
  });

  it('falls back to response details and status messages', () => {
    expect(ApiError.fromAxiosError(axiosError({ detail: 'Detail message' }, 400)).message).toBe(
      'Detail message',
    );
    expect(ApiError.fromAxiosError(axiosError({ message: 'Body message' }, 400)).message).toBe(
      'Body message',
    );
    expect(ApiError.fromAxiosError(axiosError('Plain message', 400)).message).toBe('Plain message');
    expect(ApiError.fromAxiosError(axiosError('<html>', 500)).message).toBe(
      'The server encountered an error. Please try again.',
    );
    expect(ApiError.fromAxiosError(axiosError(null, 418)).message).toBe('Request failed');
  });

  it('handles network errors without a response', () => {
    const error = ApiError.fromAxiosError(new AxiosError('Network Error', 'ERR_NETWORK'));

    expect(error).toMatchObject({
      message: 'Unable to reach the server. Check your connection and try again.',
      status: 0,
      code: 'network_error',
    });
  });

  it('builds errors from JSON, text, invalid and empty responses', async () => {
    await expect(
      ApiError.fromResponse(
        new Response(
          JSON.stringify({
            error: {
              code: 'rate_limited',
              message: 'Slow down.',
              details: { retry: ['later'] },
            },
          }),
          { status: 429, headers: { 'content-type': 'application/json', 'retry-after': '5' } },
        ),
      ),
    ).resolves.toMatchObject({
      message: 'Slow down.',
      code: 'rate_limited',
      status: 429,
      details: { retry: ['later'] },
      retryAfter: 5,
    });

    await expect(
      ApiError.fromResponse(
        new Response('Plain response', {
          status: 400,
          headers: { 'content-type': 'text/plain' },
        }),
      ),
    ).resolves.toMatchObject({ message: 'Plain response', code: 'validation_error' });

    await expect(
      ApiError.fromResponse(
        new Response('{invalid', {
          status: 502,
          headers: { 'content-type': 'application/json' },
        }),
      ),
    ).resolves.toMatchObject({ message: 'An error occurred', code: 'unknown_error' });

    await expect(
      ApiError.fromResponse(new Response('<html>', { status: 503 })),
    ).resolves.toMatchObject({
      message: 'The service is temporarily unavailable. Please try again later.',
      code: 'llm_unavailable',
    });
  });

  it('normalizes field errors', () => {
    expect(new ApiError('Error', 400).getFieldErrors()).toEqual({});

    expect(
      new ApiError('Error', 400, {
        details: {
          email: ['Already used', 'Invalid'],
          username: 'Taken',
          count: 2,
          empty: [],
        },
      }).getFieldErrors(),
    ).toEqual({
      email: ['Already used', 'Invalid'],
      username: ['Taken'],
    });
  });
});
