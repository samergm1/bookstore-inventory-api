import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { STATUS_TITLES, firstDetailMessage } from "../api/httpClient";
import { iconButtonClasses } from "../components/ui/Button";
import { cn } from "../utils/cn";

const ToastContext = createContext(null);

const DURATION_MS = { success: 4000, info: 5000, warning: 6000, error: 7000 };

const TYPE_STYLES = {
  success: { border: "border-l-green-600", title: "text-green-700 dark:text-green-400" },
  info: { border: "border-l-sky-600", title: "text-sky-700 dark:text-sky-400" },
  warning: { border: "border-l-amber-500", title: "text-amber-700 dark:text-amber-400" },
  error: { border: "border-l-red-600", title: "text-red-700 dark:text-red-400" },
};

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (type, message, title) => {
      const id = nextId++;
      setToasts((current) => [...current, { id, type, message, title }]);
      setTimeout(() => dismiss(id), DURATION_MS[type] ?? 5000);
    },
    [dismiss],
  );

  const api = useMemo(
    () => ({
      success: (message, title = "Operación exitosa") => show("success", message, title),
      info: (message, title = "Información") => show("info", message, title),
      warning: (message, title = "Atención") => show("warning", message, title),
      error: (message, title = "Error") => show("error", message, title),
      /** Displays an ApiError with a title based on the HTTP code (400, 404, 500, 503) */
      apiError: (error) => {
        const detail = firstDetailMessage(error?.details);
        const message = detail ? `${error.message} ${detail}` : error?.message || "Error inesperado.";
        const title = STATUS_TITLES[error?.status] ?? `Error ${error?.status ?? ""}`.trim();
        show("error", message, title);
      },
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div aria-live="polite" className="fixed right-4 top-4 z-100 flex w-[min(380px,calc(100vw-2rem))] flex-col gap-2.5">
        {toasts.map((t) => (
          <div
            key={t.id}
            data-toast={t.type}
            role={t.type === "error" ? "alert" : "status"}
            className={cn(
              "flex animate-slide-in items-start gap-2.5 rounded-md border border-l-4 border-slate-200 bg-white py-3 pl-4 pr-3 shadow-lg",
              "dark:border-slate-800 dark:bg-slate-900",
              TYPE_STYLES[t.type]?.border,
            )}
          >
            <div className="min-w-0 flex-1">
              {t.title && <strong className={cn("block text-sm", TYPE_STYLES[t.type]?.title)}>{t.title}</strong>}
              <p className="text-sm wrap-break-word text-slate-600 dark:text-slate-300">{t.message}</p>
            </div>
            <button type="button" className={iconButtonClasses} aria-label="Cerrar notificación" onClick={() => dismiss(t.id)}>
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return ctx;
}
