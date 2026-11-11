import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import BookFilters from "../components/books/BookFilters";
import BookFormModal from "../components/books/BookFormModal";
import BookTable from "../components/books/BookTable";
import DeleteBookDialog from "../components/books/DeleteBookDialog";
import Button from "../components/ui/Button";
import ErrorState from "../components/ui/ErrorState";
import Pagination from "../components/ui/Pagination";
import { useBooks } from "../hooks/useBooks";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useLowStockCount } from "../hooks/useLowStockCount";

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_THRESHOLD = 10;

function parseIntParam(value, fallback, min) {
  const n = Number.parseInt(value, 10);
  return Number.isInteger(n) && n >= min ? n : fallback;
}

export default function InventoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseIntParam(searchParams.get("page"), 1, 1);
  const pageSize = parseIntParam(searchParams.get("page_size"), DEFAULT_PAGE_SIZE, 1);
  const category = searchParams.get("category") ?? "";
  const lowStock = searchParams.get("low_stock") === "1";
  const threshold = parseIntParam(searchParams.get("threshold"), DEFAULT_THRESHOLD, 0);

  const [categoryInput, setCategoryInput] = useState(category);
  const [thresholdInput, setThresholdInput] = useState(String(threshold));
  const debouncedCategory = useDebouncedValue(categoryInput.trim(), 400);
  const debouncedThreshold = useDebouncedValue(thresholdInput, 400);

  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const [formState, setFormState] = useState({ open: false, book: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const updateParams = useCallback(
    (changes, { resetPage = true } = {}) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(changes).forEach(([key, value]) => {
            if (value === null || value === undefined || value === "") next.delete(key);
            else next.set(key, String(value));
          });
          if (resetPage) next.delete("page");
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  useEffect(() => {
    if (debouncedCategory !== category) updateParams({ category: debouncedCategory });
  }, [debouncedCategory]);

  useEffect(() => {
    const value = parseIntParam(debouncedThreshold, null, 0);
    if (value !== null && value !== threshold) {
      updateParams({ threshold: value === DEFAULT_THRESHOLD ? null : value });
    }
  }, [debouncedThreshold]);

  const { data, loading, error } = useBooks({ page, pageSize, category, lowStock, threshold, refreshKey });
  const lowStockCount = useLowStockCount(threshold, refreshKey);

  const pageOutOfRange = error?.status === 404 && page > 1;
  useEffect(() => {
    if (pageOutOfRange) updateParams({});
  }, [pageOutOfRange, updateParams]);

  const handleSaved = () => {
    setFormState({ open: false, book: null });
    refresh();
  };

  const handleDeleted = () => {
    setDeleteTarget(null);
    refresh();
  };

  const handleClearFilters = () => {
    setCategoryInput("");
    setThresholdInput(String(DEFAULT_THRESHOLD));
    updateParams({ category: null, low_stock: null, threshold: null });
  };

  const subtitle = (() => {
    if (!data) return "Gestiona el catálogo de libros de la librería.";
    if (lowStock) return `${data.count} libro(s) con stock <= ${threshold}`;
    if (category) return `${data.count} libro(s) en categorías que contienen «${category}»`;
    return `${data.count} libro(s) en el inventario`;
  })();

  return (
    <div className="flex flex-col gap-4 pb-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventario de libros</h1>
          <p className="text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        <Button variant="primary" className="w-full sm:w-auto" onClick={() => setFormState({ open: true, book: null })}>
          + Nuevo libro
        </Button>
      </header>

      <BookFilters
        category={categoryInput}
        onCategoryChange={setCategoryInput}
        lowStock={lowStock}
        onLowStockChange={(value) => updateParams({ low_stock: value ? "1" : null })}
        threshold={thresholdInput}
        onThresholdChange={setThresholdInput}
        lowStockCount={lowStockCount}
        onClear={handleClearFilters}
      />

      {error && !pageOutOfRange ? (
        <ErrorState error={error} onRetry={refresh} />
      ) : (
        <>
          <BookTable
            books={data?.results ?? []}
            loading={loading}
            lowStockThreshold={threshold}
            onEdit={(book) => setFormState({ open: true, book })}
            onDelete={setDeleteTarget}
          />
          {data && (
            <Pagination
              page={page}
              totalPages={data.total_pages}
              count={data.count}
              pageSize={pageSize}
              disabled={loading}
              onPageChange={(p) => updateParams({ page: p > 1 ? p : null }, { resetPage: false })}
              onPageSizeChange={(size) => updateParams({ page_size: size === DEFAULT_PAGE_SIZE ? null : size })}
            />
          )}
        </>
      )}

      <BookFormModal
        open={formState.open}
        book={formState.book}
        onClose={() => setFormState({ open: false, book: null })}
        onSaved={handleSaved}
      />
      <DeleteBookDialog book={deleteTarget} onClose={() => setDeleteTarget(null)} onDeleted={handleDeleted} />
    </div>
  );
}
