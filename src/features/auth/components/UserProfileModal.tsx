import { useState } from 'react';
import { Dialog } from '../../../shared/ui/Dialog';
import { ApiError } from '../../../shared/api/apiError';
import { notify } from '../../../shared/ui/notify';
import type { UpdateProfilePayload, User } from '../../../shared/api/types';
import { EditableField } from './EditableField';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    email: string;
    username: string;
  };
  onUpdateProfile: (payload: UpdateProfilePayload) => Promise<User>;
}

type ProfileFieldName = 'email' | 'username';

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

  const resetState = () => {
    setEditingField(null);
    setErrorMessage(null);
    setIsLoading(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetState();
      onClose();
    }
  };

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
    <Dialog open={isOpen} onOpenChange={handleOpenChange} title="Profile">
      <div className="space-y-6">
        <EditableField
          label="Email"
          value={user.email}
          draftValue={email}
          isEditing={editingField === 'email'}
          isSaving={isLoading && editingField === 'email'}
          error={editingField === 'email' ? errorMessage : null}
          inputType="email"
          autoComplete="email"
          onDraftChange={setEmail}
          onStartEdit={() => startEditing('email')}
          onCancel={cancelEditing}
          onSave={() => {
            void handleUpdateEmail();
          }}
        />

        <EditableField
          label="Username"
          value={user.username}
          draftValue={username}
          isEditing={editingField === 'username'}
          isSaving={isLoading && editingField === 'username'}
          error={editingField === 'username' ? errorMessage : null}
          inputType="text"
          autoComplete="username"
          onDraftChange={setUsername}
          onStartEdit={() => startEditing('username')}
          onCancel={cancelEditing}
          onSave={() => {
            void handleUpdateUsername();
          }}
        />

        <span className="sr-only" role="status" aria-live="polite">
          {isLoading ? 'Saving profile changes' : ''}
        </span>
      </div>
    </Dialog>
  );
};
