import { type InputHTMLAttributes, useId, useState } from 'react';
import { CircleAlert, Eye, EyeOff } from 'lucide-react';
import { type UseFormRegisterReturn } from 'react-hook-form';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | undefined;
  registration?: UseFormRegisterReturn;
}

export const Input = ({
  label,
  error,
  registration,
  type = 'text',
  className = '',
  ...props
}: InputProps) => {
  const generatedId = useId();
  const inputId = props.id ?? generatedId;
  const errorId = `${inputId}-error`;
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-ui text-text">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type={inputType}
          {...registration}
          {...props}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`h-9 w-full rounded-[var(--radius)] border bg-raised px-3 text-ui text-text transition-colors duration-fast placeholder:text-text-tertiary focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent-text focus-visible:ring-offset-0 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
            error ? 'border-danger pr-10' : 'border-border'
          } ${isPassword ? 'pr-10' : ''} ${className}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute top-1/2 right-2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-[var(--radius)] text-text-secondary transition-colors duration-fast hover:text-text focus-visible:ring-2 focus-visible:ring-accent-text focus-visible:outline-none"
          >
            {showPassword ? (
              <EyeOff aria-hidden="true" size={16} strokeWidth={1.5} />
            ) : (
              <Eye aria-hidden="true" size={16} strokeWidth={1.5} />
            )}
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} role="alert" className="flex items-start gap-2 text-small text-danger">
          <CircleAlert aria-hidden="true" size={14} strokeWidth={1.5} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
