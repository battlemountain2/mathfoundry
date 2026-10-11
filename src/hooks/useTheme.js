import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getSettings, setSettings } from "../utils/storage";
import { themePreferences } from "../utils/themePreferences";
import { useStoreChange } from "./useStoreChange";

export function useTheme() {
  useStoreChange();
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { theme, headingStyle, compactSidebar } = themePreferences(
    getSettings(),
    location.search,
  );

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark" || theme === "forest");
    root.dataset.theme = theme;
    root.dataset.heading = headingStyle;
  }, [theme, headingStyle]);

  const savePreference = useCallback(
    (key, value, previewKey) => {
      try {
        setSettings({ [key]: value });
        const params = new URLSearchParams(location.search);
        if (params.has(previewKey)) {
          params.delete(previewKey);
          navigate(
            {
              pathname: location.pathname,
              search: params.toString(),
              hash: location.hash,
            },
            { replace: true },
          );
        }
        setError("");
      } catch (err) {
        setError(err.message);
      }
    },
    [location, navigate],
  );

  const setTheme = useCallback(
    (value) => {
      if (["light", "dark", "forest"].includes(value))
        savePreference("theme", value, "theme");
    },
    [savePreference],
  );
  const setHeadingStyle = useCallback(
    (value) => {
      if (["serif", "sans"].includes(value))
        savePreference("headingStyle", value, "heading");
    },
    [savePreference],
  );
  const setCompactSidebar = useCallback(
    (value) => savePreference("compactSidebar", Boolean(value), "compact"),
    [savePreference],
  );

  return {
    theme,
    setTheme,
    headingStyle,
    setHeadingStyle,
    compactSidebar,
    setCompactSidebar,
    error,
    toggleTheme: () =>
      setTheme({ light: "dark", dark: "forest", forest: "light" }[theme]),
    toggleCompactSidebar: () => setCompactSidebar(!compactSidebar),
  };
}
