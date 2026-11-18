import { Moon, Sun } from 'lucide-react';
import { useTheme } from './useTheme';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Dark theme"
      onClick={toggleTheme}
      className="inline-flex h-11 w-16 items-center justify-center rounded-full"
    >
      <span className="relative flex h-8 w-14 items-center rounded-full border border-border bg-raised p-1 transition-colors duration-instant ease-out">
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full border border-border bg-canvas text-text-secondary transition-transform duration-base ease-out ${
            isDark ? 'translate-x-0' : 'translate-x-6'
          }`}
        >
          {isDark ? (
            <Moon size={14} strokeWidth={1.5} aria-hidden="true" />
          ) : (
            <Sun size={14} strokeWidth={1.5} aria-hidden="true" />
          )}
        </span>
      </span>
    </button>
  );
};
