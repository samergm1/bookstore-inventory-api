import { cn } from "../../utils/cn";
import { buttonClasses } from "../ui/Button";
import Card from "../ui/Card";
import Field from "../ui/Field";
import Input from "../ui/Input";


export default function BookFilters({
  category,
  onCategoryChange,
  lowStock,
  onLowStockChange,
  threshold,
  onThresholdChange,
  lowStockCount,
  onClear,
}) {
  const hasFilters = Boolean(category) || lowStock;

  return (
    <Card aria-label="Filtros" className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_auto]">
      <Field
        label="Buscar por categoría"
        htmlFor="filter-category"
        hint={lowStock ? "Desactiva «Solo stock bajo» para buscar por categoría." : null}
      >
        <Input
          id="filter-category"
          type="search"
          placeholder="Ej. Literatura, Ciencia…"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          disabled={lowStock}
        />
      </Field>

      <Field label="Umbral de stock bajo" htmlFor="filter-threshold">
        <Input
          id="filter-threshold"
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          value={threshold}
          onChange={(e) => onThresholdChange(e.target.value)}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-3 sm:col-span-2 lg:col-span-1 lg:mt-7">
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold select-none">
          <input
            type="checkbox"
            className="peer sr-only"
            checked={lowStock}
            onChange={(e) => onLowStockChange(e.target.checked)}
          />
          <span
            aria-hidden="true"
            className={cn(
              "relative h-5 w-9 shrink-0 rounded-full bg-slate-300 transition-colors dark:bg-slate-700",
              "after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-white after:shadow after:transition-transform",
              "peer-checked:bg-indigo-600 peer-checked:after:translate-x-4",
              "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-indigo-600",
            )}
          />
          Solo stock bajo
        </label>

        <button
          type="button"
          onClick={() => onLowStockChange(!lowStock)}
          title="Mostrar u ocultar libros con stock bajo"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-amber-500 px-3 py-1 text-sm transition-colors",
            lowStock
              ? "bg-amber-600 text-white"
              : "bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-400 dark:hover:bg-amber-900",
          )}
        >
          <span aria-hidden="true">⚠</span>
          <strong>{lowStockCount ?? "…"}</strong> con stock bajo
        </button>

        {hasFilters && (
          <button type="button" className={buttonClasses({ variant: "ghost", size: "sm" })} onClick={onClear}>
            Limpiar filtros
          </button>
        )}
      </div>
    </Card>
  );
}
