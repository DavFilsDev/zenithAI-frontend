import { useCallback, useEffect, useId, useRef, useState } from 'react';
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const close = useCallback(() => setIsOpen(false), []);

  useOnClickOutside(dropdownRef, close);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    menuRef.current?.querySelector<HTMLButtonElement>('button')?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const themeLabel = theme === 'light' ? 'Dark Mode' : 'Light Mode';
  const ThemeIcon = theme === 'light' ? FiMoon : FiSun;

  if (variant === 'icon') {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen((previous) => !previous)}
          aria-label="Settings"
          aria-haspopup="true"
          aria-expanded={isOpen}
          aria-controls={menuId}
          className="group flex w-full items-center justify-center rounded-lg p-2 transition-all duration-200 hover:bg-white/10"
          title="Settings"
        >
          <FiSettings
            size={20}
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:rotate-90"
          />
        </button>

        {isOpen && (
          <div
            ref={menuRef}
            id={menuId}
            role="group"
            aria-label="Settings menu"
            className="animate-slide-right absolute top-0 left-full z-50 ml-5 min-w-[160px] overflow-hidden rounded-xl border border-white/10 bg-[rgb(var(--color-bg))] shadow-2xl"
          >
            <button
              type="button"
              onClick={() => {
                onToggleTheme();
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-3 whitespace-nowrap transition-colors duration-200 hover:bg-white/10"
            >
              <ThemeIcon size={18} aria-hidden="true" />
              <span className="text-sm">{themeLabel}</span>
            </button>

            <div className="h-px bg-white/10" />

            <button
              type="button"
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-3 whitespace-nowrap text-red-500 transition-colors duration-200 hover:bg-red-500/10"
            >
              <FiLogOut size={18} aria-hidden="true" />
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
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls={menuId}
        className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200 hover:bg-white/10"
      >
        <FiSettings
          size={18}
          aria-hidden="true"
          className="transition-transform duration-200 group-hover:rotate-90"
        />
        <span className="text-sm">Settings</span>
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          id={menuId}
          role="group"
          aria-label="Settings menu"
          className="animate-slide-up absolute right-0 bottom-full left-0 z-50 mb-2 overflow-hidden rounded-xl border border-white/10 bg-[rgb(var(--color-bg))] shadow-2xl"
        >
          <button
            type="button"
            onClick={() => {
              onToggleTheme();
              setIsOpen(false);
            }}
            className="flex w-full items-center gap-3 px-4 py-3 transition-colors duration-200 hover:bg-white/10"
          >
            <ThemeIcon size={18} aria-hidden="true" />
            <span className="text-sm">{themeLabel}</span>
          </button>

          <div className="h-px bg-white/10" />

          <button
            type="button"
            onClick={() => {
              onLogout();
              setIsOpen(false);
            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-red-500 transition-colors duration-200 hover:bg-red-500/10"
          >
            <FiLogOut size={18} aria-hidden="true" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};
