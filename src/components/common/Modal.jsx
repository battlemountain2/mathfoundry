import { useId, useRef } from "react";
import { useDialogFocus } from "../../hooks/useDialogFocus";
import Button from "./Button";

export function Modal({ isOpen, onClose, title, children }) {
  const panelRef = useRef(null);
  const titleId = useId();
  useDialogFocus(isOpen, panelRef, onClose);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative bg-[var(--surface)] text-[var(--ink)] rounded-2xl shadow-2xl w-full max-w-lg border border-[var(--line)] focus:outline-none"
      >
        <div className="px-6 py-4 border-b border-[var(--line)] flex justify-between items-center gap-4">
          <h2 id={titleId} className="text-xl font-semibold">
            {title}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close dialog"
          >
            Close
          </Button>
        </div>
        <div className="p-6 max-h-[75vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
export default Modal;
