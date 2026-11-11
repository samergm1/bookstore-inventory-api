import { cn } from "../../utils/cn";

export default function Card({ as: Tag = "section", padded = true, className, children, ...rest }) {
  return (
    <Tag
      className={cn(
        "rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900",
        padded && "p-5",
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
