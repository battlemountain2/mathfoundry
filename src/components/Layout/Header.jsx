export default function Header({
  onMenuToggle,
  theme,
  onThemeChange,
  compactSidebar,
  onToggleCompactSidebar,
}) {
  return (
    <header className="study-header sticky top-0 z-30 border-b">
      <div className="desk-header-inner flex items-center justify-between px-4 sm:px-6 py-3">
        <div className="flex items-center gap-3">
          <button
            className="study-text-button lg:hidden"
            aria-label="Open navigation"
            onClick={onMenuToggle}
          >
            Menu
          </button>

          {/* Zen compact mode toggle on desktop */}
          <button
            type="button"
            className={`zen-compact-toggle hidden lg:inline-flex ${compactSidebar ? 'active' : ''}`}
            onClick={onToggleCompactSidebar}
            title={compactSidebar ? 'Expand sidebar (Standard view)' : 'Collapse sidebar (Zen focus mode)'}
            aria-label="Toggle Zen compact sidebar"
          >
            <span>{compactSidebar ? '◨ Expand' : '◫ Focus'}</span>
          </button>

          <span className="hidden sm:inline study-muted text-xs">Your study space</span>
        </div>
        <label className="theme-control flex items-center gap-2 text-xs">
          <span className="study-muted">Theme</span>
          <select
            aria-label="Color theme"
            value={theme}
            onChange={(e) => onThemeChange(e.target.value)}
            className="study-answer"
            style={{ width: 'auto', padding: '4px 8px', fontSize: 12, margin: 0 }}
          >
            <option value="light">Light paper</option>
            <option value="dark">Original dark</option>
            <option value="forest">Deep forest</option>
          </select>
        </label>
      </div>
    </header>
  );
}
export { Header };
