import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { streamMessage } from './streamMessage';
import { tokenManager } from '../../../shared/api/tokenManager';
import { server } from '../../../test/msw/node';

const streamUrl = 'http://localhost:8000/api/v1/chat/conversations/conversation-1/messages/stream/';

const streamResponse = (body: string) =>
  new HttpResponse(body, { headers: { 'Content-Type': 'text/event-stream' } });

describe('streamMessage', () => {
  it('streams tokens until the done event', async () => {
    const tokens: string[] = [];
    let authorization: string | null = null;
    tokenManager.setTokens('access-token', 'refresh-token');
    server.use(
      http.post(streamUrl, ({ request }) => {
        authorization = request.headers.get('authorization');
        return streamResponse(
          [
            'event: ping',
            '',
            'event: token',
            'data: {"content":"Hello"}',
            '',
            'event: token',
            'data: {"content":""}',
            '',
            'data: {"content":"ignored"}',
            '',
            'event: done',
            'data: {}',
            '',
            '',
          ].join('\n'),
        );
      }),
    );

    await streamMessage('conversation-1', 'Hi', {
      onToken: (content) => tokens.push(content),
    });

    expect(tokens).toEqual(['Hello']);
    expect(authorization).toBe('Bearer access-token');
  });

  it('throws stream errors', async () => {
    server.use(
      http.post(streamUrl, () =>
        streamResponse('event: error\ndata: {"code":"llm_unavailable","message":"Model down"}\n\n'),
      ),
    );

    await expect(
      streamMessage('conversation-1', 'Hi', { onToken: () => undefined }),
    ).rejects.toMatchObject({
      code: 'llm_unavailable',
      message: 'Model down',
    });
  });

  it('rejects incomplete streams', async () => {
    server.use(
      http.post(streamUrl, () => streamResponse('event: token\ndata: {"content":"partial"}\n\n')),
    );

    await expect(
      streamMessage('conversation-1', 'Hi', { onToken: () => undefined }),
    ).rejects.toMatchObject({ code: 'stream_incomplete' });
  });

  it('rejects responses without a body', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      body: null,
    } as Response);

    await expect(
      streamMessage('conversation-1', 'Hi', { onToken: () => undefined }),
    ).rejects.toMatchObject({ code: 'stream_unavailable' });
  });
});
