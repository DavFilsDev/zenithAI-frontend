import { useEffect, useState, type ReactNode } from 'react';
import { env } from '../api/env';
import { ThemeContext, type Theme } from './themeContext';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');

    if (saved === 'light' || saved === 'dark') {
      return saved;
    }

    return env.defaultTheme;
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);

    document.documentElement.classList.toggle('dark', theme === 'dark');

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#1f2937' : '#ffffff');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
  );
};
