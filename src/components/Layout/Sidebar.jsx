import { Link, useLocation } from "react-router-dom";
export default function Sidebar({ isOpen, onToggle, compactSidebar, onToggleCompact }) {
  const { pathname } = useLocation();
  const learning = [
    "/learn",
    "/foundations",
    "/path",
    "/module",
    "/diagnostic",
    "/rulebook",
  ].some((path) => pathname.startsWith(path));
  const progress = ["/progress", "/review", "/repair"].some((path) =>
    pathname.startsWith(path),
  );
  const links = [
    { to: "/", label: "Today", active: pathname === "/" },
    { to: "/learn", label: "Learn", active: learning },
    { to: "/practice", label: "Practice", active: pathname === "/practice" },
    { to: "/progress", label: "Progress", active: progress },
  ];
  return (
    <>
      {isOpen && (
        <button
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          aria-label="Close navigation"
          onClick={onToggle}
        />
      )}
      <aside
        className={`study-sidebar fixed inset-y-0 left-0 z-50 w-64 border-r transition-transform duration-200 ${
          compactSidebar ? "lg:-translate-x-full" : "lg:translate-x-0"
        } ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="sidebar-inner">
          <div className="flex items-center justify-between mb-4">
            <Link
              to="/"
              className="study-brand"
              onClick={() => {
                if (isOpen) onToggle();
              }}
            >
              MathFoundry<span>Personal learning</span>
            </Link>
            {onToggleCompact && (
              <button
                type="button"
                onClick={onToggleCompact}
                className="zen-compact-toggle hidden lg:inline-flex p-1.5"
                title="Collapse sidebar to Zen focus mode"
                aria-label="Collapse sidebar"
              >
                ◫
              </button>
            )}
          </div>
          <nav className="desk-navigation" aria-label="Primary navigation">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                aria-current={link.active ? "page" : undefined}
                className={
                  link.active ? "desk-nav-link selected" : "desk-nav-link"
                }
                onClick={() => {
                  if (isOpen) onToggle();
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <Link
              className="desk-nav-link"
              to="/settings"
              onClick={() => {
                if (isOpen) onToggle();
              }}
            >
              Settings & backup
            </Link>
            <p>Your space to build understanding.</p>
          </div>
        </div>
      </aside>
    </>
  );
}
export { Sidebar };
