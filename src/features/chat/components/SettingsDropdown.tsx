import { useCallback, useRef, useState } from 'react';
import { FiSettings, FiSun, FiMoon, FiLogOut } from 'react-icons/fi';
import { useOnClickOutside } from '../../../shared/hooks/useOnClickOutside';

interface SettingsDropdownProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLogout: () => void;
  variant?: 'full' | 'icon';
}

export const SettingsDropdown = ({
  theme,
  onToggleTheme,
  onLogout,
  variant = 'full',
}: SettingsDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setIsOpen(false), []);

  useOnClickOutside(dropdownRef, close);

  const themeLabel = theme === 'light' ? 'Dark Mode' : 'Light Mode';
  const ThemeIcon = theme === 'light' ? FiMoon : FiSun;

  if (variant === 'icon') {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-white/10 transition-all duration-200 group"
          title="Settings"
        >
          <FiSettings
            size={20}
            className="transition-transform duration-200 group-hover:rotate-90"
          />
        </button>

        {isOpen && (
          <div className="absolute left-full top-0 ml-5 min-w-[160px] bg-[rgb(var(--color-bg))] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-slide-right z-50">
            <button
              onClick={() => {
                onToggleTheme();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors duration-200 whitespace-nowrap"
            >
              <ThemeIcon size={18} />
              <span className="text-sm">{themeLabel}</span>
            </button>

            <div className="h-px bg-white/10" />

            <button
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 transition-colors duration-200 text-red-500 whitespace-nowrap"
            >
              <FiLogOut size={18} />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 group"
      >
        <FiSettings
          size={18}
          className="transition-transform duration-200 group-hover:rotate-90"
        />
        <span className="text-sm">Settings</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-[rgb(var(--color-bg))] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-slide-up z-50">
          <button
            onClick={() => {
              onToggleTheme();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors duration-200"
          >
            <ThemeIcon size={18} />
            <span className="text-sm">{themeLabel}</span>
          </button>

          <div className="h-px bg-white/10" />

          <button
            onClick={() => {
              onLogout();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 transition-colors duration-200 text-red-500"
          >
            <FiLogOut size={18} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};
