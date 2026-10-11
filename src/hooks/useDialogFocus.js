import { useEffect, useEffectEvent } from "react";

// Shared keyboard, scrolling and focus lifecycle for modal panels.
export function useDialogFocus(isOpen, panelRef, onClose, initialFocusRef) {
  const close = useEffectEvent(onClose);
  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    (initialFocusRef?.current || panelRef.current)?.focus();
    function onKey(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const nodes = [
        ...panel.querySelectorAll(
          'button, input, textarea, select, a[href], [tabindex="0"]',
        ),
      ].filter(
        (node) =>
          !node.disabled &&
          node.tabIndex >= 0 &&
          node.getClientRects().length &&
          getComputedStyle(node).visibility !== "hidden",
      );
      const first = nodes[0],
        last = nodes.at(-1);
      if (!first) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const outside = !nodes.includes(document.activeElement);
      if (event.shiftKey && (document.activeElement === first || outside)) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || outside)
      ) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [isOpen, panelRef, initialFocusRef]);
}
