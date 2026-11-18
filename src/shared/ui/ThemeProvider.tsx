import { useEffect, useState, type ReactNode } from 'react';
import { ThemeContext, type Theme } from './themeContext';

interface ThemeProviderProps {
  children: ReactNode;
}

const getInitialTheme = (): Theme => {
  const saved = localStorage.getItem('theme');

  return saved === 'light' || saved === 'dark' ? saved : 'dark';
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === 'dark';

    localStorage.setItem('theme', theme);
    root.classList.toggle('dark', isDark);
    root.classList.toggle('light', !isDark);

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const canvas = getComputedStyle(root).getPropertyValue('--color-canvas').trim();
      metaThemeColor.setAttribute('content', canvas || (isDark ? '#0a0a0b' : '#ffffff'));
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};
