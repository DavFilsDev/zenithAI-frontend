import React, { useState } from 'react';
import { FiX, FiMail, FiUser, FiLock } from 'react-icons/fi';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    email: string;
    username: string;
  };
  onUpdateEmail: (email: string) => Promise<void>;
  onUpdateUsername: (username: string) => Promise<void>;
  onUpdatePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateEmail,
  onUpdateUsername,
  onUpdatePassword,
}) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [email, setEmail] = useState(user.email);
  const [username, setUsername] = useState(user.username);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpdateEmail = async () => {
    setIsLoading(true);
    try {
      await onUpdateEmail(email);
      setEditingField(null);
    } catch (error) {
      console.error('Failed to update email:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUsername = async () => {
    setIsLoading(true);
    try {
      await onUpdateUsername(username);
      setEditingField(null);
    } catch (error) {
      console.error('Failed to update username:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      await onUpdatePassword(oldPassword, newPassword);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setEditingField(null);
    } catch (error) {
      console.error('Failed to update password:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[rgb(var(--color-bg))] border border-white/10 rounded-2xl shadow-2xl z-50 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold">Profile</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <FiMail size={14} /> Email
              </label>
              {editingField !== 'email' && (
                <button
                  onClick={() => setEditingField('email')}
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
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[rgb(var(--color-primary))] transition-colors"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateEmail}
                    disabled={isLoading}
                    className="flex-1 px-3 py-1 bg-[rgb(var(--color-primary))] text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setEditingField(null)}
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

          {/* Username Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <FiUser size={14} /> Username
              </label>
              {editingField !== 'username' && (
                <button
                  onClick={() => setEditingField('username')}
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
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[rgb(var(--color-primary))] transition-colors"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateUsername}
                    disabled={isLoading}
                    className="flex-1 px-3 py-1 bg-[rgb(var(--color-primary))] text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setEditingField(null)}
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

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <FiLock size={14} /> Password
              </label>
              {editingField !== 'password' && (
                <button
                  onClick={() => setEditingField('password')}
                  className="text-xs text-[rgb(var(--color-primary))] hover:underline"
                >
                  Update
                </button>
              )}
            </div>
            {editingField === 'password' ? (
              <div className="space-y-2">
                <input
                  type="password"
                  placeholder="Current password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[rgb(var(--color-primary))] transition-colors"
                />
                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[rgb(var(--color-primary))] transition-colors"
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[rgb(var(--color-primary))] transition-colors"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdatePassword}
                    disabled={isLoading}
                    className="flex-1 px-3 py-1 bg-[rgb(var(--color-primary))] text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
                  >
                    {isLoading ? 'Updating...' : 'Update Password'}
                  </button>
                  <button
                    onClick={() => setEditingField(null)}
                    className="px-3 py-1 bg-white/10 rounded-lg hover:bg-white/20 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
                ••••••••
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};