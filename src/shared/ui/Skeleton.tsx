import type { HTMLAttributes } from 'react';

export type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export const Skeleton = ({ className = '', ...props }: SkeletonProps) => {
  return (
    <div
      aria-hidden="true"
      {...props}
      className={`animate-skeleton rounded-[var(--radius)] bg-raised ${className}`}
    />
  );
};
