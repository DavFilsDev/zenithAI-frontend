import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { Sidebar } from './Sidebar';
import { server } from '../../../test/msw/node';
import { renderWithProviders } from '../../../test/utils';
import { useChatUiStore } from '../model/chatUiStore';

const baseUrl = 'http://localhost:8000/api/v1';

const conversations = [
  {
    uuid: 'conversation-1',
    title: 'First conversation',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    message_count: 2,
  },
  {
    uuid: 'conversation-2',
    title: 'Second conversation',
    created_at: '2026-01-02T00:00:00Z',
    updated_at: '2026-01-02T00:00:00Z',
    message_count: 1,
  },
];

const mockConversations = () => {
  server.use(
    http.get(`${baseUrl}/chat/conversations/`, ({ request }) => {
      const page = Number(new URL(request.url).searchParams.get('page') ?? '1');
      return HttpResponse.json({
        count: conversations.length,
        next: page === 1 ? 'http://localhost:8000/api/v1/chat/conversations/?page=2' : null,
        previous: page > 1 ? 'http://localhost:8000/api/v1/chat/conversations/?page=1' : null,
        results: page === 1 ? conversations : [conversations[1]],
      });
    }),
    http.patch(`${baseUrl}/chat/conversations/conversation-1/`, () =>
      HttpResponse.json({ ...conversations[0], title: 'Renamed conversation' }),
    ),
    http.delete(
      `${baseUrl}/chat/conversations/conversation-1/`,
      () => new HttpResponse(null, { status: 204 }),
    ),
  );
};

describe('Sidebar', () => {
  it('navigates, renames, deletes, paginates and manages the session menu', async () => {
    mockConversations();
    const onLogout = vi.fn();
    const onOpenProfile = vi.fn();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();

    renderWithProviders(
      <Sidebar
        user={{ id: 1, email: 'ada@example.com', username: 'ada' }}
        onLogout={onLogout}
        onOpenProfile={onOpenProfile}
      />,
      { route: '/chat/conversation-1', path: '/chat/:uuid?' },
    );

    expect(await screen.findByText('First conversation')).toBeInTheDocument();

    await user.click(screen.getByText('Second conversation'));
    await waitFor(() => {
      expect(screen.getByLabelText('location')).toHaveTextContent('/chat/conversation-2');
    });

    useChatUiStore.getState().setDraft('draft text');
    await user.click(screen.getByRole('button', { name: 'New chat' }));
    await waitFor(() => {
      expect(screen.getByLabelText('location')).toHaveTextContent('/chat');
    });
    expect(useChatUiStore.getState().draft).toBe('');

    await user.click(screen.getAllByTitle('Rename conversation')[0]!);
    const titleInput = screen.getByDisplayValue('First conversation');
    await user.clear(titleInput);
    await user.type(titleInput, 'Renamed conversation');
    await user.click(screen.getByTitle('Save title'));
    expect(await screen.findByText('Conversation renamed.')).toBeInTheDocument();

    await user.click(screen.getAllByTitle('Delete conversation')[0]!);
    expect(confirm).toHaveBeenCalled();
    expect(await screen.findByText('Conversation deleted.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByText('Page 2')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Previous' }));
    expect(await screen.findByText('Page 1')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Settings' }));
    await user.click(screen.getByRole('button', { name: 'Light Mode' }));
    await user.click(screen.getByRole('button', { name: 'Settings' }));
    expect(screen.getByRole('button', { name: 'Dark Mode' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Logout' }));
    expect(onLogout).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toBeInTheDocument();
    await user.click(screen.getByTitle('Profile'));
    expect(onOpenProfile).toHaveBeenCalled();

    fireEvent.keyDown(window, { key: 'b', ctrlKey: true });
    expect(screen.getByRole('button', { name: 'Collapse sidebar' })).toBeInTheDocument();
  });
});
