import { env } from '../../../shared/api/env';
import { tokenManager } from '../../../shared/api/tokenManager';
import { refreshAccessToken, endSession } from '../../../shared/api/authInterceptor';
import { ApiError } from '../../../shared/api/apiError';

interface StreamMessageOptions {
  signal?: AbortSignal;
  onToken: (content: string) => void;
}

interface ParsedEvent {
  event: string;
  data: string;
}

const parseEvent = (chunk: string): ParsedEvent | null => {
  let event = 'message';
  const data: string[] = [];

  for (const line of chunk.split('\n')) {
    if (line.startsWith('event:')) {
      event = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      data.push(line.slice(5).trimStart());
    }
  }

  if (data.length === 0) {
    return null;
  }

  return { event, data: data.join('\n') };
};

const postStream = (
  conversationUuid: string,
  content: string,
  signal?: AbortSignal
): Promise<Response> => {
  const token = tokenManager.getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(
    `${env.apiUrl.replace(/\/$/, '')}/chat/conversations/${conversationUuid}/messages/stream/`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ message: content }),
      signal: signal ?? null,
    }
  );
};

export const streamMessage = async (
  conversationUuid: string,
  content: string,
  { signal, onToken }: StreamMessageOptions
): Promise<void> => {
  let response = await postStream(conversationUuid, content, signal);

  if (response.status === 401 && tokenManager.hasValidTokens()) {
    try {
      await refreshAccessToken();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        endSession();
      }
      throw error;
    }

    response = await postStream(conversationUuid, content, signal);
  }

  if (response.status === 401) {
    endSession();
  }

  if (!response.ok) {
    throw await ApiError.fromResponse(response);
  }

  if (!response.body) {
    throw new ApiError('The server did not return a stream.', 0, {
      code: 'stream_unavailable',
    });
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let finished = false;

  try {
    while (!finished) {
      const result = await reader.read();

      if (result.done) {
        break;
      }

      buffer += decoder.decode(result.value, { stream: true });
      const chunks = buffer.split('\n\n');
      buffer = chunks.pop() ?? '';

      for (const chunk of chunks) {
        const parsed = parseEvent(chunk);

        if (!parsed) {
          continue;
        }

        if (parsed.event === 'token') {
          const payload = JSON.parse(parsed.data) as { content?: string };
          if (payload.content) {
            onToken(payload.content);
          }
        } else if (parsed.event === 'done') {
          finished = true;
          break;
        } else if (parsed.event === 'error') {
          const payload = JSON.parse(parsed.data) as { code?: string; message?: string };
          throw new ApiError(payload.message ?? 'The assistant could not respond.', 0, {
            code: payload.code ?? 'stream_error',
          });
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  if (!finished) {
    throw new ApiError('The stream ended unexpectedly.', 0, {
      code: 'stream_incomplete',
    });
  }
};
