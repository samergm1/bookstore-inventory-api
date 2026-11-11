import { useEffect, useRef } from "react";
import { cn } from "../../utils/cn";
import { iconButtonClasses } from "./Button";

const SIZES = { sm: "max-w-md", md: "max-w-2xl" };

export default function Modal({ open, title, onClose, children, footer, size = "md", closeDisabled = false }) {
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    dialogRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const handleKey = (event) => {
      if (event.key === "Escape" && !closeDisabled) onCloseRef.current?.();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, closeDisabled]);

  if (!open) return null;

  const handleBackdrop = (event) => {
    if (event.target === event.currentTarget && !closeDisabled) onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-slate-950/55 p-4"
      onMouseDown={handleBackdrop}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className={cn(
          "flex max-h-[calc(100vh-2rem)] w-full animate-pop-in flex-col rounded-xl bg-white shadow-2xl outline-none",
          "dark:bg-slate-900 dark:ring-1 dark:ring-slate-800",
          SIZES[size],
        )}
      >
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <h2 id="modal-title" className="text-lg font-semibold">
            {title}
          </h2>
          <button type="button" className={iconButtonClasses} onClick={onClose} disabled={closeDisabled} aria-label="Cerrar">
            ×
          </button>
        </header>
        <div className="overflow-y-auto p-5">{children}</div>
        {footer && (
          <footer className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3.5 dark:border-slate-800">{footer}</footer>
        )}
      </div>
    </div>
  );
}
