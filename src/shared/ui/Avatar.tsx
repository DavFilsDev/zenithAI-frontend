import type { HTMLAttributes } from 'react';

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  name: string;
  size?: 24 | 32;
}

const sizeClasses = {
  24: 'h-6 w-6 text-[10px]',
  32: 'h-8 w-8 text-small',
} as const;

export const Avatar = ({ name, size = 24, className = '', ...props }: AvatarProps) => {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <span
      {...props}
      aria-label={props['aria-label'] ?? name}
      className={`inline-flex items-center justify-center rounded-full bg-raised font-mono text-text-secondary ${sizeClasses[size]} ${className}`}
    >
      {initials || '?'}
    </span>
  );
};
