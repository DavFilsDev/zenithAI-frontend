import { LoaderCircle } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'border-accent bg-accent text-on-accent enabled:hover:bg-accent-hover enabled:active:bg-accent-active',
  secondary: 'border-border bg-surface text-text enabled:hover:bg-hover enabled:active:bg-raised',
  ghost:
    'border-transparent bg-transparent text-text enabled:hover:bg-hover enabled:active:bg-raised',
  danger:
    'border-danger bg-transparent text-danger enabled:hover:bg-raised enabled:active:bg-hover',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-7 px-3',
  md: 'h-9 px-4',
  lg: 'h-11 px-5',
};

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius)] border text-ui whitespace-nowrap transition-colors duration-fast focus-visible:ring-2 focus-visible:ring-accent-text focus-visible:ring-offset-2 focus-visible:ring-offset-canvas focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 [@media(pointer:coarse)]:min-h-11';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className = '',
  type = 'button',
  disabled,
  ...props
}: ButtonProps) => {
  return (
    <button
      {...props}
      type={type}
      disabled={loading || disabled}
      aria-busy={loading || undefined}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading && (
        <LoaderCircle aria-hidden="true" size={14} strokeWidth={1.5} className="animate-spin" />
      )}
      {children}
    </button>
  );
};
