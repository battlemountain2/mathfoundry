export default function Header({ onMenuToggle, theme, onThemeChange }) {
  return (
    <header className="study-header sticky top-0 z-30 border-b">
      <div className="desk-header-inner">
        <div>
          <button
            className="study-text-button lg:hidden"
            aria-label="Open navigation"
            onClick={onMenuToggle}
          >
            Menu
          </button>
          <span className="hidden lg:inline study-muted">Your study space</span>
        </div>
        <label className="theme-control">
          Theme
          <select
            aria-label="Color theme"
            value={theme}
            onChange={(e) => onThemeChange(e.target.value)}
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
