import { Link, useLocation } from "react-router-dom";
import { useRef } from "react";
import { useDialogFocus } from "../../hooks/useDialogFocus";
export default function Sidebar({ isOpen, onToggle, compactSidebar }) {
  const { pathname } = useLocation();
  const panelRef = useRef(null);
  useDialogFocus(isOpen, panelRef, onToggle);
  const links = [
    { to: "/", label: "Today", active: pathname === "/" },
    {
      to: "/courses",
      label: "Courses",
      active: pathname.startsWith("/courses") || pathname.startsWith("/learn"),
    },
    { to: "/recall", label: "Recall", active: pathname.startsWith("/recall") },
    {
      to: "/review",
      label: "Your work",
      active: pathname.startsWith("/review") || pathname.startsWith("/repair"),
    },
    {
      to: "/rulebook",
      label: "Rulebook",
      active: pathname.startsWith("/rulebook"),
    },
    {
      to: "/settings",
      label: "Settings",
      active: pathname.startsWith("/settings"),
    },
  ];
  return (
    <>
      {isOpen && (
        <button
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          aria-label="Dismiss navigation backdrop"
          tabIndex={-1}
          onClick={onToggle}
        />
      )}
      <aside
        ref={panelRef}
        id="study-sidebar"
        role={isOpen ? "dialog" : undefined}
        aria-modal={isOpen ? true : undefined}
        aria-label={isOpen ? "Navigation" : undefined}
        tabIndex={-1}
        className={`study-sidebar fixed inset-y-0 left-0 z-50 w-64 border-r transition-transform duration-200 ${isOpen ? "visible translate-x-0" : `invisible -translate-x-full ${compactSidebar ? "lg:invisible lg:-translate-x-full" : "lg:visible lg:translate-x-0"}`}`}
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
              <svg
                className="athena-mark"
                viewBox="0 0 40 40"
                aria-hidden="true"
              >
                <path d="M 7 7 L 20 12 L 33 7 L 31 26 L 20 34 L 9 26 Z" />
                <circle cx="14" cy="19" r="5" />
                <circle cx="26" cy="19" r="5" />
                <path d="M 17 26 L 20 29 L 23 26 M 7 7 L 14 14 M 33 7 L 26 14" />
              </svg>
              <div>
                Athena<span>Personal study studio</span>
              </div>
            </Link>
            {isOpen && (
              <button
                className="study-text-button min-h-11 px-2 lg:hidden"
                aria-label="Close navigation"
                onClick={onToggle}
              >
                Close
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
        </div>
      </aside>
    </>
  );
}
export { Sidebar };
