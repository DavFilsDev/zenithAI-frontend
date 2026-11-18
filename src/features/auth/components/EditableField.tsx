import { useId } from 'react';
import { CircleAlert } from 'lucide-react';
import { Button } from '../../../shared/ui/Button';

interface EditableFieldProps {
  label: string;
  value: string;
  draftValue: string;
  isEditing: boolean;
  isSaving: boolean;
  error?: string | null;
  inputType?: 'text' | 'email';
  autoComplete?: string;
  onDraftChange: (value: string) => void;
  onStartEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
}

export const EditableField = ({
  label,
  value,
  draftValue,
  isEditing,
  isSaving,
  error,
  inputType = 'text',
  autoComplete,
  onDraftChange,
  onStartEdit,
  onCancel,
  onSave,
}: EditableFieldProps) => {
  const id = useId();
  const inputId = `${id}-input`;
  const errorId = `${id}-error`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={inputId} className="block text-ui text-text">
          {label}
        </label>
        {!isEditing && (
          <button
            type="button"
            onClick={onStartEdit}
            aria-label={`Update ${label.toLowerCase()}`}
            className="text-small text-accent-text underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-accent-text focus-visible:outline-none"
          >
            Update
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <input
            id={inputId}
            type={inputType}
            autoComplete={autoComplete}
            value={draftValue}
            onChange={(event) => onDraftChange(event.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            disabled={isSaving}
            className={`h-9 w-full rounded-[var(--radius)] border bg-raised px-3 text-ui text-text transition-colors duration-fast placeholder:text-text-tertiary focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent-text focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
              error ? 'border-danger' : 'border-border'
            }`}
          />
          {error && (
            <p id={errorId} role="alert" className="flex items-start gap-2 text-small text-danger">
              <CircleAlert
                aria-hidden="true"
                size={14}
                strokeWidth={1.5}
                className="mt-0.5 shrink-0"
              />
              <span>{error}</span>
            </p>
          )}
          <div className="flex items-center gap-2">
            <Button type="button" size="sm" onClick={onSave} loading={isSaving}>
              Save
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isSaving}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <p
          id={inputId}
          className="min-h-9 rounded-[var(--radius)] border border-border bg-raised px-3 py-2 text-ui text-text"
        >
          {value}
        </p>
      )}
    </div>
  );
};
