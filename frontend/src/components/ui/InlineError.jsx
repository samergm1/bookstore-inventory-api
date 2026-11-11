import { cn } from "../../utils/cn";

/** Error message inside form or card */
export default function InlineError({ className, children }) {
  return (
    <p role="alert" className={cn("rounded-md bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:bg-red-950 dark:text-red-400", className)}>
      {children}
    </p>
  );
}
