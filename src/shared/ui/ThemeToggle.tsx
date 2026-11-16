import { Sun, Moon } from 'lucide-react';
import { useTheme } from './useTheme';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      aria-pressed={isDark}
      className="relative flex h-9 w-16 items-center justify-between rounded-full border border-gray-400 bg-red-200 p-1 backdrop-blur-md transition-all duration-300 dark:border-white/10 dark:bg-white/5"
    >
      <div
        className={`absolute top-1 left-1 flex h-7 w-7 items-center justify-center rounded-full shadow-md transition-all duration-300 ease-in-out ${
          isDark ? 'translate-x-0 bg-[rgb(var(--color-primary))]' : 'translate-x-7 bg-yellow-400'
        } `}
      />

      <div className="z-10 flex h-7 w-7 items-center justify-center">
        <Moon
          size={16}
          className={`transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-400'}`}
        />
      </div>

      <div className="z-10 flex h-7 w-7 items-center justify-center">
        <Sun
          size={16}
          className={`transition-colors duration-300 ${!isDark ? 'text-white' : 'text-yellow-400'}`}
        />
      </div>
    </button>
  );
};
