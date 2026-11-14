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
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[rgb(var(--color-bg))] border border-white/10 rounded-2xl shadow-2xl z-50 animate-scale-up">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold">Profile</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
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
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[rgb(var(--color-primary))] transition-colors"
                />
                {errorMessage && <p className="text-xs text-red-500">{errorMessage}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      void handleUpdateEmail();
                    }}
                    disabled={isLoading}
                    className="flex-1 px-3 py-1 bg-[rgb(var(--color-primary))] text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="px-3 py-1 bg-white/10 rounded-lg hover:bg-white/20 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
                {user.email}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
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
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[rgb(var(--color-primary))] transition-colors"
                />
                {errorMessage && <p className="text-xs text-red-500">{errorMessage}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      void handleUpdateUsername();
                    }}
                    disabled={isLoading}
                    className="flex-1 px-3 py-1 bg-[rgb(var(--color-primary))] text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="px-3 py-1 bg-white/10 rounded-lg hover:bg-white/20 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
                {user.username}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
