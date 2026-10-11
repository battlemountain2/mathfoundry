export function themePreferences(settings = {}, search = "") {
  const params = new URLSearchParams(search);
  const theme = params.get("theme") || settings.theme;
  const heading = params.get("heading") || settings.headingStyle;
  return {
    theme: ["light", "dark", "forest"].includes(theme) ? theme : "light",
    headingStyle: ["serif", "sans"].includes(heading) ? heading : "sans",
    compactSidebar: params.has("compact")
      ? params.get("compact") === "true"
      : Boolean(settings.compactSidebar),
  };
}
