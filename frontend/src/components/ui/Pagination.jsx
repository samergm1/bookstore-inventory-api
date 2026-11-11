import { cn } from "../../utils/cn";
import { buttonClasses } from "./Button";
import { inputClasses } from "./Input";

const PAGE_SIZES = [5, 10, 20, 50];

function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("…");
  for (let p = start; p <= end; p += 1) pages.push(p);
  if (end < total - 1) pages.push("…");
  pages.push(total);
  return pages;
}

export default function Pagination({ page, totalPages, count, pageSize, onPageChange, onPageSizeChange, disabled }) {
  if (!count) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, count);

  return (
    <nav className="flex flex-wrap items-center justify-between gap-3" aria-label="Paginación">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Mostrando{" "}
        <strong className="text-slate-700 dark:text-slate-200">
          {from}-{to}
        </strong>{" "}
        de <strong className="text-slate-700 dark:text-slate-200">{count}</strong>
      </p>

      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          className={buttonClasses({ variant: "ghost", size: "sm" })}
          onClick={() => onPageChange(page - 1)}
          disabled={disabled || page <= 1}
        >
          ‹ Anterior
        </button>
        {getPageNumbers(page, totalPages).map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="px-1 text-slate-400">
              …
            </span>
          ) : (
            <button
              type="button"
              key={p}
              className={buttonClasses({ variant: p === page ? "primary" : "ghost", size: "sm", className: "min-w-8" })}
              aria-current={p === page ? "page" : undefined}
              onClick={() => onPageChange(p)}
              disabled={disabled}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          className={buttonClasses({ variant: "ghost", size: "sm" })}
          onClick={() => onPageChange(page + 1)}
          disabled={disabled || page >= totalPages}
        >
          Siguiente ›
        </button>
      </div>

      <label className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        Por página
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          disabled={disabled}
          className={cn(inputClasses(), "w-auto py-1")}
        >
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>
    </nav>
  );
}
