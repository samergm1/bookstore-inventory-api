import { cn } from "../../utils/cn";

const SIZES = {
  sm: "size-3.5 border-2",
  md: "size-5 border-2 text-indigo-600 dark:text-indigo-400",
  lg: "size-8 border-[3px] text-indigo-600 dark:text-indigo-400",
};

export default function Spinner({ size = "md", label = "Cargando", className }) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn("inline-block shrink-0 animate-spin rounded-full border-current border-r-transparent", SIZES[size], className)}
    />
  );
}
