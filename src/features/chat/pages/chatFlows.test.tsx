import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { ChatPage } from './ChatPage';
import { server } from '../../../test/msw/node';
import { renderWithProviders } from '../../../test/utils';
import { useChatUiStore } from '../model/chatUiStore';

const baseUrl = 'http://localhost:8000/api/v1';

const conversation = {
  uuid: 'conversation-1',
  title: 'Hello',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  message_count: 0,
};

const messagePage = (results: unknown[] = []) => ({
  count: results.length,
  next: null,
  previous: null,
  results,
});

const mockConversation = (messages: unknown[] = []) => {
  server.use(
    http.get(`${baseUrl}/chat/conversations/conversation-1/`, () =>
      HttpResponse.json({ ...conversation, messages }),
    ),
    http.get(`${baseUrl}/chat/conversations/conversation-1/messages/`, () =>
      HttpResponse.json(messagePage(messages)),
    ),
  );
};

describe('chat flows', () => {
  it('sends a message and renders the streamed reply', async () => {
    server.use(
      http.post(`${baseUrl}/chat/conversations/`, () =>
        HttpResponse.json(conversation, { status: 201 }),
      ),
      http.post(
        `${baseUrl}/chat/conversations/conversation-1/messages/stream/`,
        () =>
          new HttpResponse(
            'event: token\ndata: {"content":"Hello"}\n\nevent: token\ndata: {"content":" world"}\n\nevent: done\ndata: {"message_id":"message-2","conversation_id":"conversation-1"}\n\n',
            { headers: { 'Content-Type': 'text/event-stream' } },
          ),
      ),
    );
    mockConversation([
      {
        uuid: 'message-1',
        role: 'user',
        content: 'Hi there',
        created_at: '2026-01-01T00:00:00Z',
      },
      {
        uuid: 'message-2',
        role: 'assistant',
        content: 'Hello world',
        created_at: '2026-01-01T00:00:00Z',
      },
    ]);

    const user = userEvent.setup();
    renderWithProviders(<ChatPage />, { route: '/chat', path: '/chat/:uuid?' });

    await user.type(screen.getByRole('textbox', { name: 'Message' }), 'Hi there');
    await user.click(screen.getByRole('button', { name: 'Send message' }));

    expect(await screen.findByText('Hi there')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryAllByText('Hello world')).toHaveLength(1);
    });
    await waitFor(() => {
      expect(screen.getByLabelText('location')).toHaveTextContent('/chat/conversation-1');
    });
  });

  it('restores the draft and shows a rate limit message', async () => {
    mockConversation();
    server.use(
      http.post(`${baseUrl}/chat/conversations/conversation-1/messages/stream/`, () =>
        HttpResponse.json(
          { error: { code: 'rate_limited', message: 'Slow down.' } },
          { status: 429, headers: { 'Retry-After': '2' } },
        ),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<ChatPage />, {
      route: '/chat/conversation-1',
      path: '/chat/:uuid?',
    });

    await user.type(screen.getByRole('textbox', { name: 'Message' }), 'Please reply');
    await user.click(screen.getByRole('button', { name: 'Send message' }));

    expect(
      await screen.findByText('Too many requests. Try again in 2 seconds.'),
    ).toBeInTheDocument();
    expect(useChatUiStore.getState().draft).toBe('Please reply');
  });
});
