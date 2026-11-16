import { type InputHTMLAttributes, useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
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

  return (
    <div className="relative space-y-1">
      <label htmlFor={inputId} className="text-sm font-medium opacity-80">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type={isPassword && showPassword ? 'text' : type}
          {...registration}
          {...props}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2 pr-10 backdrop-blur-md transition-all focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:outline-none dark:border-white/10 dark:bg-white/5 ${className} `}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute top-1/2 right-3 -translate-y-1/2 opacity-60 transition hover:opacity-100"
          >
            {showPassword ? (
              <EyeOff className="text-[rgb(var(--color-primary))]" size={18} />
            ) : (
              <Eye className="text-[rgb(var(--color-primary))]" size={18} />
            )}
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};
