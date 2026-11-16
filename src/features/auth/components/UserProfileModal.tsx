import { useState } from 'react';
import { FiX, FiMail, FiUser } from 'react-icons/fi';
import { ApiError } from '../../../shared/api/apiError';
import { notify } from '../../../shared/ui/notify';
import type { UpdateProfilePayload, User } from '../../../shared/api/types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    email: string;
    username: string;
  };
  onUpdateProfile: (payload: UpdateProfilePayload) => Promise<User>;
}

export const UserProfileModal = ({
  isOpen,
  onClose,
  user,
  onUpdateProfile,
}: UserProfileModalProps) => {
  const [editingField, setEditingField] = useState<'email' | 'username' | null>(null);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const startEditing = (field: 'email' | 'username') => {
    setEmail(user.email);
    setUsername(user.username);
    setErrorMessage(null);
    setEditingField(field);
  };

  const cancelEditing = () => {
    setEditingField(null);
    setErrorMessage(null);
  };

  const messageFor = (error: unknown, field: string, fallback: string): string => {
    if (error instanceof ApiError) {
      return error.getFieldErrors()[field]?.[0] ?? error.message;
    }
    return fallback;
  };

  const handleUpdateEmail = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await onUpdateProfile({ email });
      notify.success('Email updated successfully!');
      setEditingField(null);
    } catch (error) {
      setErrorMessage(messageFor(error, 'email', 'Failed to update email.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUsername = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await onUpdateProfile({ username });
      notify.success('Username updated successfully!');
      setEditingField(null);
    } catch (error) {
      setErrorMessage(messageFor(error, 'username', 'Failed to update username.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label="Close profile dialog"
        tabIndex={-1}
        className="animate-fade-in fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="animate-scale-up fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-[rgb(var(--color-bg))] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 p-6">
          <h2 className="text-xl font-bold">Profile</h2>
          <button
            onClick={onClose}
            aria-label="Close profile"
            className="rounded-lg p-1 transition-colors hover:bg-white/10"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="profile-email"
                className="flex items-center gap-2 text-sm font-medium text-gray-400"
              >
                <FiMail size={14} /> Email
              </label>
              {editingField !== 'email' && (
                <button
                  onClick={() => startEditing('email')}
                  className="text-xs text-[rgb(var(--color-primary))] hover:underline"
                >
                  Update
                </button>
              )}
            </div>
            {editingField === 'email' ? (
              <div className="space-y-2">
                <input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition-colors focus:border-[rgb(var(--color-primary))] focus:outline-none"
                />
                {errorMessage && <p className="text-xs text-red-500">{errorMessage}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      void handleUpdateEmail();
                    }}
                    disabled={isLoading}
                    className="flex-1 rounded-lg bg-[rgb(var(--color-primary))] px-3 py-1 text-white transition hover:opacity-90 disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="rounded-lg bg-white/10 px-3 py-1 transition hover:bg-white/20"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                {user.email}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="profile-username"
                className="flex items-center gap-2 text-sm font-medium text-gray-400"
              >
                <FiUser size={14} /> Username
              </label>
              {editingField !== 'username' && (
                <button
                  onClick={() => startEditing('username')}
                  className="text-xs text-[rgb(var(--color-primary))] hover:underline"
                >
                  Update
                </button>
              )}
            </div>
            {editingField === 'username' ? (
              <div className="space-y-2">
                <input
                  id="profile-username"
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition-colors focus:border-[rgb(var(--color-primary))] focus:outline-none"
                />
                {errorMessage && <p className="text-xs text-red-500">{errorMessage}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      void handleUpdateUsername();
                    }}
                    disabled={isLoading}
                    className="flex-1 rounded-lg bg-[rgb(var(--color-primary))] px-3 py-1 text-white transition hover:opacity-90 disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="rounded-lg bg-white/10 px-3 py-1 transition hover:bg-white/20"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                {user.username}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
