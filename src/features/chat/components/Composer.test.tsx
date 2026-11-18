import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Composer } from './Composer';
import { useChatUiStore } from '../model/chatUiStore';

describe('Composer', () => {
  it('shows a stop button and calls onStop when streaming', async () => {
    const onStop = vi.fn();
    const user = userEvent.setup();

    render(<Composer onSendMessage={vi.fn()} onStop={onStop} isStreaming />);

    await user.click(screen.getByRole('button', { name: 'Stop generating' }));
    expect(onStop).toHaveBeenCalledTimes(1);
  });

  it('calls onStop when Escape is pressed while streaming', async () => {
    const onStop = vi.fn();
    const user = userEvent.setup();

    render(<Composer onSendMessage={vi.fn()} onStop={onStop} isStreaming />);

    await user.click(screen.getByRole('textbox', { name: 'Message' }));
    await user.keyboard('{Escape}');

    expect(onStop).toHaveBeenCalledTimes(1);
  });

  it('sends a trimmed message on Enter and shows the hint', async () => {
    const onSendMessage = vi.fn();
    const user = userEvent.setup();
    useChatUiStore.getState().setDraft('Hello world');

    render(<Composer onSendMessage={onSendMessage} />);

    expect(screen.getByText('Enter to send · Shift+Enter for newline')).toBeInTheDocument();

    await user.click(screen.getByRole('textbox', { name: 'Message' }));
    await user.keyboard('{Enter}');

    expect(onSendMessage).toHaveBeenCalledWith('Hello world');
  });
});
