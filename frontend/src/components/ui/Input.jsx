import { cn } from "../../utils/cn";

export function inputClasses(invalid = false) {
  return cn(
    "block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 shadow-xs placeholder:text-slate-400",
    "focus:outline-none focus:ring-3 disabled:cursor-not-allowed disabled:bg-slate-100",
    "dark:bg-slate-900 dark:text-slate-100 dark:disabled:bg-slate-800",
    invalid
      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
      : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-slate-700",
  );
}

export default function Input({ invalid = false, className, ...rest }) {
  return <input className={cn(inputClasses(invalid), className)} aria-invalid={invalid || undefined} {...rest} />;
}
