import { act, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { useSendMessage } from './useSendMessage';
import { conversationKeys } from '../api/queryKeys';
import type { Message } from '../api/types';
import { server } from '../../../test/msw/node';
import { renderHookWithProviders } from '../../../test/utils';

describe('useSendMessage', () => {
  it('cancels an in-flight stream and removes temporary messages', async () => {
    server.use(
      http.post(
        'http://localhost:8000/api/v1/chat/conversations/conversation-1/messages/stream/',
        () =>
          new HttpResponse(
            new ReadableStream<Uint8Array>({
              start(controller) {
                controller.enqueue(
                  new TextEncoder().encode('event: token\ndata: {"content":"partial"}\n\n'),
                );
              },
            }),
            { headers: { 'Content-Type': 'text/event-stream' } },
          ),
      ),
    );

    const { result, queryClient } = renderHookWithProviders(() => useSendMessage());

    act(() => {
      void result.current.send({
        conversationUuid: 'conversation-1',
        content: 'Cancel me',
      });
    });

    await waitFor(() => {
      expect(
        queryClient.getQueryData<Message[]>(conversationKeys.messages('conversation-1')),
      ).toHaveLength(2);
    });

    act(() => {
      result.current.abort();
    });

    await waitFor(() => {
      expect(result.current.isSending).toBe(false);
    });
    await waitFor(() => {
      expect(
        queryClient.getQueryData<Message[]>(conversationKeys.messages('conversation-1')),
      ).toEqual([]);
    });
  });
});
