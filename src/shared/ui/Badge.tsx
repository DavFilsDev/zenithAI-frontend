import type { HTMLAttributes } from 'react';

export type BadgeVariant = 'neutral' | 'success' | 'warning' | 'danger';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: 'border-border text-text-secondary bg-transparent',
  success: 'border-transparent text-success bg-success-subtle',
  warning: 'border-transparent text-warning bg-warning-subtle',
  danger: 'border-transparent text-danger bg-danger-subtle',
};

export const Badge = ({ variant = 'neutral', className = '', children, ...props }: BadgeProps) => {
  return (
    <span
      {...props}
      className={`inline-flex items-center rounded-[var(--radius-sm)] border px-2 py-0.5 font-mono text-label uppercase ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
