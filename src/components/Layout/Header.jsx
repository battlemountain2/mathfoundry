export default function Header({
  onMenuToggle,
  theme,
  onThemeChange,
  compactSidebar,
  onToggleCompactSidebar,
  onOpenTutor,
}) {
  return (
    <header className="study-header sticky top-0 z-30 border-b">
      <div className="desk-header-inner flex items-center justify-between px-4 sm:px-6 h-14">
        {/* Left Side: Navigation & Focus Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="h-9 px-3 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)] hover:bg-[var(--surface)] text-xs font-medium lg:hidden flex items-center gap-1.5 transition-colors cursor-pointer"
            aria-label="Open navigation"
            onClick={onMenuToggle}
          >
            <span>☰</span>
            <span>Menu</span>
          </button>

          {/* Zen compact focus mode toggle on desktop */}
          <button
            type="button"
            className={`zen-compact-toggle h-9 px-3 rounded-lg border text-xs font-medium hidden lg:inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
              compactSidebar ? 'active border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] font-semibold' : 'border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-2)] hover:text-[var(--ink)] hover:border-[var(--line-strong)]'
            }`}
            onClick={onToggleCompactSidebar}
            title={compactSidebar ? 'Expand sidebar (Standard view)' : 'Collapse sidebar (Zen focus mode)'}
            aria-label="Toggle Zen compact sidebar"
          >
            <span className="text-sm leading-none">{compactSidebar ? '◨' : '◫'}</span>
            <span>{compactSidebar ? 'Expand' : 'Focus'}</span>
          </button>

          <span className="hidden sm:inline-block text-[var(--ink-2)] text-xs font-normal">Your study space</span>
        </div>

        {/* Right Side: Tutor & Theme Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {onOpenTutor && (
            <button
              type="button"
              onClick={onOpenTutor}
              className="tutor-header-btn h-9 px-3 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)] hover:border-[var(--line-strong)] hover:bg-[var(--surface)] text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Open Ada Study Tutor"
              aria-label="Open Ada Study Tutor"
            >
              <span className="text-indigo-500 font-bold text-sm leading-none">∑</span>
              <span>Tutor</span>
            </button>
          )}

          <div className="theme-control flex items-center gap-1.5 h-9 px-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-xs text-[var(--ink-2)]">
            <span className="hidden sm:inline text-[var(--ink-2)]">Theme</span>
            <select
              aria-label="Color theme"
              value={theme}
              onChange={(e) => onThemeChange(e.target.value)}
              className="bg-transparent text-[var(--ink)] font-medium text-xs focus:outline-none cursor-pointer pr-1"
            >
              <option value="light">Light paper</option>
              <option value="dark">Original dark</option>
              <option value="forest">Deep forest</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
export { Header };
