import { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmDialog } from './ConfirmDialog';
import { Dialog } from './Dialog';

const DialogHarness = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open dialog
      </button>
      <Dialog open={open} onOpenChange={setOpen} title="Example dialog">
        <p>Dialog body</p>
        <button type="button">Action</button>
      </Dialog>
    </>
  );
};

describe('Dialog', () => {
  it('focuses initially, traps focus, and restores focus on close', async () => {
    const user = userEvent.setup();
    render(<DialogHarness />);

    const openButton = screen.getByRole('button', { name: 'Open dialog' });
    await user.click(openButton);

    const dialog = screen.getByRole('dialog', { name: 'Example dialog' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');

    const closeButton = screen.getByRole('button', { name: 'Close dialog' });
    const actionButton = screen.getByRole('button', { name: 'Action' });

    await waitFor(() => {
      expect(closeButton).toHaveFocus();
    });
    expect(document.body.style.overflow).toBe('hidden');

    await user.tab({ shift: true });
    expect(actionButton).toHaveFocus();

    await user.tab();
    expect(closeButton).toHaveFocus();

    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(openButton).toHaveFocus();
    expect(document.body.style.overflow).toBe('');
  });

  it('closes on Escape and scrim click', async () => {
    const user = userEvent.setup();
    render(<DialogHarness />);

    const openButton = screen.getByRole('button', { name: 'Open dialog' });
    await user.click(openButton);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    await user.click(openButton);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const scrim = document.querySelector('[aria-hidden="true"].fixed.inset-0');
    expect(scrim).toBeTruthy();
    await user.click(scrim as Element);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});

describe('ConfirmDialog', () => {
  it('renders consequence copy and calls confirm/cancel actions', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();

    render(
      <ConfirmDialog
        open
        onOpenChange={onOpenChange}
        title="Delete conversation"
        description="This conversation will be permanently deleted."
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByRole('dialog', { name: 'Delete conversation' })).toBeInTheDocument();
    expect(screen.getByText('This conversation will be permanently deleted.')).toBeInTheDocument();

    const cancel = screen.getByRole('button', { name: 'Cancel' });
    const del = screen.getByRole('button', { name: 'Delete' });

    await waitFor(() => {
      expect(cancel).toHaveFocus();
    });

    await user.click(del);
    expect(onConfirm).toHaveBeenCalledTimes(1);

    await user.click(cancel);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
