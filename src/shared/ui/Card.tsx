import type { HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  radius?: 'none' | 'default';
}

export const Card = ({ radius = 'default', className = '', ...props }: CardProps) => {
  const radiusClass =
    radius === 'none' ? 'rounded-[var(--radius-none)]' : 'rounded-[var(--radius)]';

  return (
    <div {...props} className={`border border-border bg-surface p-6 ${radiusClass} ${className}`} />
  );
};
