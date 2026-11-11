import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import BookFormModal from "../components/books/BookFormModal";
import DeleteBookDialog from "../components/books/DeleteBookDialog";
import PriceCalculator from "../components/books/PriceCalculator";
import StockBadge from "../components/books/StockBadge";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ErrorState from "../components/ui/ErrorState";
import Spinner from "../components/ui/Spinner";
import { useBook } from "../hooks/useBook";
import { formatDateTime, formatMoney } from "../utils/format";

function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const goBack = () => (location.key !== "default" ? navigate(-1) : navigate("/"));
  return (
    <button
      type="button"
      onClick={goBack}
      className="self-start text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
    >
      ← Volver al inventario
    </button>
  );
}

function InfoRow({ label, children }) {
  return (
    <div className="flex justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}

export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { book, setBook, loading, error, reload } = useBook(id);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (loading && !book) {
    return (
      <div className="flex flex-col items-center gap-3 py-20">
        <Spinner size="lg" />
        <p className="text-slate-500">Cargando libro…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 pb-12">
        <BackButton />
        <ErrorState
          error={error}
          title={error.status === 404 ? "Libro no encontrado" : undefined}
          onRetry={error.status === 404 ? undefined : reload}
        />
      </div>
    );
  }

  const handleCalculated = (result) =>
    setBook((prev) => ({ ...prev, selling_price_local: result.selling_price_local, currency: result.currency }));

  return (
    <div className="flex flex-col gap-4 pb-12">
      <BackButton />

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge>{book.category}</Badge>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">{book.title}</h1>
          <p className="text-slate-500 dark:text-slate-400">{book.author}</p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <Button className="flex-1 sm:flex-none" onClick={() => setEditing(true)}>
            Editar
          </Button>
          <Button variant="danger" className="flex-1 sm:flex-none" onClick={() => setConfirmDelete(true)}>
            Eliminar
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_1.3fr]">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Información</h2>
          <dl className="divide-y divide-slate-200 text-sm dark:divide-slate-800">
            <InfoRow label="ISBN">
              <span className="font-mono text-xs">{book.isbn}</span>
            </InfoRow>
            <InfoRow label="País del proveedor">
              {book.supplier_country} <span className="text-slate-500">({book.currency})</span>
            </InfoRow>
            <InfoRow label="Costo">{formatMoney(book.cost_usd, "USD")}</InfoRow>
            <InfoRow label="Precio de venta">
              {book.selling_price_local == null ? (
                <span className="text-slate-400">Sin calcular</span>
              ) : (
                <strong>{formatMoney(book.selling_price_local, book.currency)}</strong>
              )}
            </InfoRow>
            <InfoRow label="Stock">
              <StockBadge quantity={book.stock_quantity} />
            </InfoRow>
            <InfoRow label="Creado">{formatDateTime(book.created_at)}</InfoRow>
            <InfoRow label="Actualizado">{formatDateTime(book.updated_at)}</InfoRow>
          </dl>
        </Card>

        <PriceCalculator key={book.id} book={book} onCalculated={handleCalculated} />
      </div>

      <BookFormModal
        open={editing}
        book={book}
        onClose={() => setEditing(false)}
        onSaved={(saved) => {
          setEditing(false);
          setBook(saved);
        }}
      />
      <DeleteBookDialog
        book={confirmDelete ? book : null}
        onClose={() => setConfirmDelete(false)}
        onDeleted={() => navigate("/", { replace: true })}
      />
    </div>
  );
}
