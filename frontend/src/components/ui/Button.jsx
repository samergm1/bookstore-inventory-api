import { cn } from "../../utils/cn";
import Spinner from "./Spinner";

const VARIANTS = {
  primary:
    "border-transparent bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:text-slate-950 dark:hover:bg-indigo-400",
  secondary:
    "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
  ghost: "border-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
  danger: "border-transparent bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-400",
  "danger-ghost": "border-transparent text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950",
};

const SIZES = {
  sm: "px-2.5 py-1 text-sm",
  md: "px-4 py-2 text-sm",
};

/** Reusable button classes */
export function buttonClasses({ variant = "secondary", size = "md", className } = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border font-semibold transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
    "disabled:pointer-events-none disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

/** Square button for icons (close modal / toast) */
export const iconButtonClasses =
  "rounded-md px-2 py-0.5 text-2xl leading-none text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-200";

/**
 * Generic reusable button.
 * variant: "primary" | "secondary" | "ghost" | "danger" | "danger-ghost"
 * loading: shows spinner and disables the button
 */
export default function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  disabled = false,
  type = "button",
  className,
  children,
  ...rest
}) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <Spinner size="sm" label="Procesando" />}
      <span>{children}</span>
    </button>
  );
}
