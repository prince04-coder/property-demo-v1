import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

/**
 * @typedef {'light'|'dark'|'system'} Theme
 */

/**
 * @typedef {Object} ThemeContextValue
 * @property {Theme} theme - Current theme setting
 * @property {(theme: Theme) => void} setTheme - Set theme
 * @property {string} resolvedTheme - Actual applied theme (light or dark)
 */

const ThemeContext = createContext(null);

/**
 * Determines the system color scheme preference.
 * @returns {'dark'|'light'} The system preference
 */
function getSystemTheme() {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Applies the theme class to the document root element.
 * @param {'light'|'dark'} resolvedTheme - The theme to apply
 */
function applyTheme(resolvedTheme) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(resolvedTheme);
}

/**
 * Theme provider that replaces next-themes.
 * Supports light, dark, and system themes with localStorage persistence.
 * Applies the 'dark' class to <html> element for Tailwind's class-based dark mode.
 */
export function ThemeProvider({ children, defaultTheme = 'system' }) {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem('theme') || defaultTheme;
    } catch {
      return defaultTheme;
    }
  });

  const resolvedTheme = theme === 'system' ? getSystemTheme() : theme;

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('theme', newTheme);
    } catch {
      // localStorage unavailable
    }
  }, []);

  // Apply theme on mount and when it changes
  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  // Listen for system theme changes when in 'system' mode
  useEffect(() => {
    if (theme !== 'system') return;

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme(getSystemTheme());
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [theme]);

  const value = useMemo(
    () => ({ theme, setTheme, resolvedTheme }),
    [theme, setTheme, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Hook to access theme context. Replaces next-themes useTheme().
 * @returns {ThemeContextValue}
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
