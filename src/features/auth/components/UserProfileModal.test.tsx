import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { UserProfileModal } from './UserProfileModal';
import { ApiError } from '../../../shared/api/apiError';
import { notify } from '../../../shared/ui/notify';
import type { User } from '../../../shared/api/types';

const user: User = {
  id: 1,
  email: 'ada@example.com',
  username: 'ada',
};

const renderModal = (isOpen = true) => {
  const onClose = vi.fn();
  const onUpdateProfile = vi.fn(() => Promise.resolve(user));

  render(
    <UserProfileModal
      isOpen={isOpen}
      onClose={onClose}
      user={user}
      onUpdateProfile={onUpdateProfile}
    />,
  );

  return { onClose, onUpdateProfile };
};

describe('UserProfileModal', () => {
  it('behaves as a dialog, closes on Escape, locks scroll, and restores focus', async () => {
    const trigger = document.createElement('button');
    trigger.textContent = 'Open profile';
    document.body.appendChild(trigger);
    trigger.focus();

    const onClose = vi.fn();
    const onUpdateProfile = vi.fn(() => Promise.resolve(user));
    const { rerender } = render(
      <UserProfileModal isOpen onClose={onClose} user={user} onUpdateProfile={onUpdateProfile} />,
    );

    expect(screen.getByRole('dialog', { name: 'Profile' })).toHaveAttribute('aria-modal', 'true');
    const closeButton = screen.getByRole('button', { name: 'Close dialog' });
    const lastButton = screen.getByRole('button', { name: 'Update username' });
    const userEventInstance = userEvent.setup();

    await waitFor(() => {
      expect(closeButton).toHaveFocus();
    });
    expect(document.body.style.overflow).toBe('hidden');

    await userEventInstance.tab({ shift: true });
    expect(lastButton).toHaveFocus();
    await userEventInstance.tab();
    expect(closeButton).toHaveFocus();

    await userEventInstance.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);

    rerender(
      <UserProfileModal
        isOpen={false}
        onClose={onClose}
        user={user}
        onUpdateProfile={onUpdateProfile}
      />,
    );

    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe('');
    trigger.remove();
  });

  it('renders nothing when closed and closes from dialog controls', async () => {
    const { onClose } = renderModal(false);
    expect(screen.queryByText('Profile')).not.toBeInTheDocument();

    const userEventInstance = userEvent.setup();
    const { onClose: openOnClose } = renderModal();

    await userEventInstance.click(screen.getByRole('button', { name: 'Close dialog' }));
    expect(openOnClose).toHaveBeenCalledTimes(1);

    await userEventInstance.click(document.querySelector('[aria-hidden="true"].fixed.inset-0')!);
    expect(openOnClose).toHaveBeenCalledTimes(2);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('updates the email and shows a saving state', async () => {
    const success = vi.spyOn(notify, 'success');
    const { onUpdateProfile } = renderModal();
    let resolveUpdate!: (value: User) => void;
    onUpdateProfile.mockImplementationOnce(
      () =>
        new Promise<User>((resolve) => {
          resolveUpdate = resolve;
        }),
    );
    const userEventInstance = userEvent.setup();

    await userEventInstance.click(screen.getByRole('button', { name: 'Update email' }));
    const emailInput = screen.getByLabelText('Email');
    await userEventInstance.clear(emailInput);
    await userEventInstance.type(emailInput, 'new@example.com');
    await userEventInstance.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    expect(onUpdateProfile).toHaveBeenCalledWith({ email: 'new@example.com' });

    resolveUpdate({ ...user, email: 'new@example.com' });

    await waitFor(() => {
      expect(success).toHaveBeenCalledWith('Email updated successfully!');
    });
    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
  });

  it('updates the username and cancels editing', async () => {
    const success = vi.spyOn(notify, 'success');
    const { onUpdateProfile } = renderModal();
    const userEventInstance = userEvent.setup();

    await userEventInstance.click(screen.getByRole('button', { name: 'Update username' }));
    await userEventInstance.type(screen.getByLabelText('Username'), 'grace');
    await userEventInstance.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByLabelText('Username')).not.toBeInTheDocument();
    expect(screen.getByText('ada')).toBeInTheDocument();

    await userEventInstance.click(screen.getByRole('button', { name: 'Update username' }));
    await userEventInstance.clear(screen.getByLabelText('Username'));
    await userEventInstance.type(screen.getByLabelText('Username'), 'grace');
    await userEventInstance.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(onUpdateProfile).toHaveBeenCalledWith({ username: 'grace' });
    });
    expect(success).toHaveBeenCalledWith('Username updated successfully!');
  });

  it('shows field errors, API errors, and fallback errors', async () => {
    const { onUpdateProfile } = renderModal();
    const userEventInstance = userEvent.setup();

    onUpdateProfile.mockRejectedValueOnce(
      new ApiError('Email unavailable', 400, { details: { email: ['Already used'] } }),
    );
    await userEventInstance.click(screen.getByRole('button', { name: 'Update email' }));
    await userEventInstance.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Already used')).toBeInTheDocument();

    await userEventInstance.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByText('Already used')).not.toBeInTheDocument();

    onUpdateProfile.mockRejectedValueOnce(new ApiError('Server unavailable', 500));
    await userEventInstance.click(screen.getByRole('button', { name: 'Update username' }));
    await userEventInstance.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Server unavailable')).toBeInTheDocument();

    await userEventInstance.click(screen.getByRole('button', { name: 'Cancel' }));
    onUpdateProfile.mockRejectedValueOnce(new Error('boom'));
    await userEventInstance.click(screen.getByRole('button', { name: 'Update username' }));
    await userEventInstance.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Failed to update username.')).toBeInTheDocument();
  });
});
