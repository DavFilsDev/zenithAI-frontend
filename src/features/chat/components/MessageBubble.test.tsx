import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MessageBubble } from './MessageBubble';
import { notify } from '../../../shared/ui/notify';
import type { Message } from '../api/types';

const assistantMessage = {
  uuid: 'message-1',
  role: 'assistant',
  content: '**Hello** world',
  created_at: '2026-01-01T00:00:00Z',
} as Message;

const userMessage = {
  uuid: 'message-2',
  role: 'user',
  content: 'Hi there',
  created_at: '2026-01-01T00:00:00Z',
} as Message;

const setClipboard = (value: unknown) => {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value,
  });
};

describe('MessageBubble', () => {
  it('copies assistant messages', async () => {
    const success = vi.spyOn(notify, 'success');
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard({ writeText });

    render(<MessageBubble message={assistantMessage} />);

    expect(screen.getByText('Hello')).toBeInTheDocument();
    await user.click(screen.getByTitle('Copy message'));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('**Hello** world');
    });
    expect(success).toHaveBeenCalledWith('Copied to clipboard.');
  });

  it('reports missing and failing clipboard support', async () => {
    const error = vi.spyOn(notify, 'error');
    const user = userEvent.setup();

    setClipboard(undefined);
    render(<MessageBubble message={userMessage} />);
    await user.click(screen.getByTitle('Copy message'));
    expect(error).toHaveBeenCalledWith('Clipboard is not available.');

    setClipboard({ writeText: vi.fn().mockRejectedValue(new Error('Denied')) });
    await user.click(screen.getByTitle('Copy message'));
    await waitFor(() => {
      expect(error).toHaveBeenCalledWith('Could not copy message.');
    });
  });

  it('renders a typing indicator without copy or timestamp controls', () => {
    render(<MessageBubble message={{ ...assistantMessage, content: '' }} />);

    expect(screen.queryByTitle('Copy message')).not.toBeInTheDocument();
    expect(screen.queryByText(/\d{2}:\d{2}/)).not.toBeInTheDocument();
  });
});
