import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
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

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type ProfileFieldName = 'email' | 'username';

interface ProfileFieldProps {
  field: ProfileFieldName;
  label: string;
  icon: ReactNode;
  inputType: 'email' | 'text';
  value: string;
  displayValue: string;
  isEditing: boolean;
  errorMessage: string | null;
  errorId: string;
  isLoading: boolean;
  onChange: (value: string) => void;
  onStartEditing: () => void;
  onCancel: () => void;
  onSave: () => Promise<void> | void;
}

const ProfileField = ({
  field,
  label,
  icon,
  inputType,
  value,
  displayValue,
  isEditing,
  errorMessage,
  errorId,
  isLoading,
  onChange,
  onStartEditing,
  onCancel,
  onSave,
}: ProfileFieldProps) => {
  const inputId = `profile-${field}`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor={inputId}
          className="flex items-center gap-2 text-sm font-medium text-gray-400"
        >
          {icon} {label}
        </label>
        {!isEditing && (
          <button
            type="button"
            onClick={onStartEditing}
            aria-label={`Update ${field}`}
            className="text-xs text-accent-text hover:underline"
          >
            Update
          </button>
        )}
      </div>
      {isEditing ? (
        <div className="space-y-2">
          <input
            id={inputId}
            type={inputType}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            aria-invalid={Boolean(errorMessage)}
            aria-describedby={errorMessage ? errorId : undefined}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition-colors focus:border-accent focus:outline-none"
          />
          {errorMessage && (
            <p id={errorId} role="alert" className="text-xs text-red-500">
              {errorMessage}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                void onSave();
              }}
              disabled={isLoading}
              aria-busy={isLoading || undefined}
              className="flex-1 rounded-lg bg-accent px-3 py-1 text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg bg-white/10 px-3 py-1 transition hover:bg-white/20"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">{displayValue}</div>
      )}
    </div>
  );
};

export const UserProfileModal = ({
  isOpen,
  onClose,
  user,
  onUpdateProfile,
}: UserProfileModalProps) => {
  const [editingField, setEditingField] = useState<ProfileFieldName | null>(null);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();
  const emailErrorId = `${titleId}-email-error`;
  const usernameErrorId = `${titleId}-username-error`;

  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const originalOverflow = document.body.style.overflow;
    const dialog = dialogRef.current;

    document.body.style.overflow = 'hidden';

    const getFocusableElements = () =>
      Array.from(dialog?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []);

    getFocusableElements()[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusableElements = getFocusableElements();

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog?.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previouslyFocused?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const startEditing = (field: ProfileFieldName) => {
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
        className="fixed inset-0 z-50 animate-fade-in bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-busy={isLoading || undefined}
        tabIndex={-1}
        className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 animate-scale-up rounded-2xl border border-white/10 bg-canvas shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 p-6">
          <h2 id={titleId} className="text-xl font-bold">
            Profile
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile"
            className="rounded-lg p-1 transition-colors hover:bg-white/10"
          >
            <FiX size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <ProfileField
            field="email"
            label="Email"
            icon={<FiMail size={14} aria-hidden="true" />}
            inputType="email"
            value={email}
            displayValue={user.email}
            isEditing={editingField === 'email'}
            errorMessage={errorMessage}
            errorId={emailErrorId}
            isLoading={isLoading}
            onChange={setEmail}
            onStartEditing={() => startEditing('email')}
            onCancel={cancelEditing}
            onSave={handleUpdateEmail}
          />

          <ProfileField
            field="username"
            label="Username"
            icon={<FiUser size={14} aria-hidden="true" />}
            inputType="text"
            value={username}
            displayValue={user.username}
            isEditing={editingField === 'username'}
            errorMessage={errorMessage}
            errorId={usernameErrorId}
            isLoading={isLoading}
            onChange={setUsername}
            onStartEditing={() => startEditing('username')}
            onCancel={cancelEditing}
            onSave={handleUpdateUsername}
          />
        </div>

        <span className="sr-only" role="status" aria-live="polite">
          {isLoading ? 'Saving profile changes' : ''}
        </span>
      </div>
    </>
  );
};
