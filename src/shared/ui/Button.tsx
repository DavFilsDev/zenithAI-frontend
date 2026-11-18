import { LoaderCircle } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';
import { type ButtonSize, type ButtonVariant, getButtonClassName } from './buttonStyles';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

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
      className={getButtonClassName({ variant, size, fullWidth, className })}
    >
      {loading && (
        <LoaderCircle aria-hidden="true" size={14} strokeWidth={1.5} className="animate-spin" />
      )}
      {children}
    </button>
  );
};
