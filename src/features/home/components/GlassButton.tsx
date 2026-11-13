import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface GlassButtonProps {
  children: ReactNode;
  onClick?: () => void;
  to?: string;
  className?: string;
}

export const GlassButton = ({ children, onClick, to, className }: GlassButtonProps) => {
  const baseClasses = `
    px-8 py-4 rounded-xl font-semibold
    bg-white/10 dark:bg-white/5
    backdrop-blur-md
    border border-white/20 dark:border-white/10
    text-[rgb(var(--color-text))]
    shadow-lg hover:shadow-xl
    transition-all duration-300
    hover:scale-105 active:scale-95
    inline-flex items-center justify-center
  `;

  if (to) {
    return (
      <Link to={to} className={`${baseClasses} ${className ?? ''}`}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={`${baseClasses} ${className ?? ''}`}>
      {children}
    </button>
  );
};
