import { useState, useEffect, useCallback } from 'react';
import { getSettings, setSettings, subscribeStore } from '../utils/storage';
export function useTheme() {
  const [error, setError] = useState('');
  
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const urlTheme = searchParams?.get('theme');
  const urlHeading = searchParams?.get('heading');
  const urlCompact = searchParams?.get('compact');

  const settings = getSettings();
  const initialTheme = ['light', 'dark', 'forest'].includes(urlTheme) ? urlTheme : (settings.theme || 'light');
  const initialHeading = ['serif', 'sans'].includes(urlHeading) ? urlHeading : (settings.headingStyle || 'serif');
  const initialCompact = urlCompact !== null ? urlCompact === 'true' : Boolean(settings.compactSidebar);

  const [theme, setThemeState] = useState(initialTheme);
  const [headingStyle, setHeadingStyleState] = useState(initialHeading);
  const [compactSidebar, setCompactSidebarState] = useState(initialCompact);

  useEffect(() => {
    if (['light', 'dark', 'forest'].includes(urlTheme)) setThemeState(urlTheme);
    if (['serif', 'sans'].includes(urlHeading)) setHeadingStyleState(urlHeading);
    if (urlCompact !== null) setCompactSidebarState(urlCompact === 'true');
  }, [urlTheme, urlHeading, urlCompact]);

  useEffect(() => subscribeStore(() => {
    const fresh = getSettings();
    if (!['light', 'dark', 'forest'].includes(new URLSearchParams(window.location.search).get('theme'))) {
      setThemeState(fresh.theme || 'light');
    }
    if (!['serif', 'sans'].includes(new URLSearchParams(window.location.search).get('heading'))) {
      setHeadingStyleState(fresh.headingStyle || 'serif');
    }
    if (new URLSearchParams(window.location.search).get('compact') === null) {
      setCompactSidebarState(Boolean(fresh.compactSidebar));
    }
  }), []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark' || theme === 'forest');
    root.dataset.theme = theme;
    root.dataset.heading = headingStyle;
  }, [theme, headingStyle]);

  const setTheme = useCallback((value) => {
    if (!['light', 'dark', 'forest'].includes(value)) return;
    try {
      setSettings({ theme: value });
      setThemeState(value);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const setHeadingStyle = useCallback((value) => {
    if (!['serif', 'sans'].includes(value)) return;
    try {
      setSettings({ headingStyle: value });
      setHeadingStyleState(value);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const setCompactSidebar = useCallback((value) => {
    try {
      setSettings({ compactSidebar: Boolean(value) });
      setCompactSidebarState(Boolean(value));
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const toggleCompactSidebar = useCallback(() => {
    setCompactSidebar(!compactSidebar);
  }, [compactSidebar, setCompactSidebar]);

  const toggleTheme = useCallback(() => {
    setTheme({ light: 'dark', dark: 'forest', forest: 'light' }[theme] || 'light');
  }, [theme, setTheme]);

  return {
    theme,
    toggleTheme,
    setTheme,
    headingStyle,
    setHeadingStyle,
    compactSidebar,
    setCompactSidebar,
    toggleCompactSidebar,
    error,
  };
}
