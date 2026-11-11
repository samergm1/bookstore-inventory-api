import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";
import { formatMoney } from "../../utils/format";
import Badge from "../ui/Badge";
import { buttonClasses } from "../ui/Button";
import Card from "../ui/Card";
import Spinner from "../ui/Spinner";
import StockBadge from "./StockBadge";

const TH =
  "whitespace-nowrap bg-slate-50 px-3.5 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase dark:bg-slate-800/60 dark:text-slate-400";
const TD = "border-t border-slate-200 px-3.5 py-3 align-middle dark:border-slate-800";

export default function BookTable({ books, loading, lowStockThreshold, onEdit, onDelete }) {
  return (
    <Card as="div" padded={false} aria-busy={loading} className="relative min-h-44 overflow-x-auto">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-slate-900/60">
          <Spinner size="lg" label="Cargando libros" />
        </div>
      )}
      <table className="w-full min-w-215 border-collapse text-sm">
        <thead>
          <tr>
            <th className={TH}>Título / Autor</th>
            <th className={TH}>ISBN</th>
            <th className={TH}>Categoría</th>
            <th className={cn(TH, "text-right")}>Costo</th>
            <th className={cn(TH, "text-right")}>Precio venta</th>
            <th className={cn(TH, "text-right")}>Stock</th>
            <th className={cn(TH, "w-px text-right")}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {books.length === 0 && !loading ? (
            <tr>
              <td colSpan={7} className={cn(TD, "py-12 text-center text-slate-500 dark:text-slate-400")}>
                No se encontraron libros con los filtros actuales.
              </td>
            </tr>
          ) : (
            books.map((book) => (
              <tr key={book.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className={cn(TD, "min-w-55")}>
                  <Link to={`/books/${book.id}`} className="font-semibold text-slate-900 hover:underline dark:text-slate-100">
                    {book.title}
                  </Link>
                  <div className="text-slate-500 dark:text-slate-400">{book.author}</div>
                </td>
                <td className={cn(TD, "font-mono text-xs")}>{book.isbn}</td>
                <td className={TD}>
                  <Badge>{book.category}</Badge>
                </td>
                <td className={cn(TD, "text-right whitespace-nowrap tabular-nums")}>{formatMoney(book.cost_usd, "USD")}</td>
                <td className={cn(TD, "text-right whitespace-nowrap tabular-nums")}>
                  {book.selling_price_local == null ? (
                    <span className="text-slate-400">Sin calcular</span>
                  ) : (
                    formatMoney(book.selling_price_local, book.currency)
                  )}
                </td>
                <td className={cn(TD, "text-right")}>
                  <StockBadge quantity={book.stock_quantity} threshold={lowStockThreshold} />
                </td>
                <td className={TD}>
                  <div className="flex justify-end gap-1">
                    <Link
                      to={`/books/${book.id}`}
                      className={buttonClasses({ variant: "ghost", size: "sm" })}
                      title="Ver detalle y calcular precio"
                    >
                      Ver / Precio
                    </Link>
                    <button type="button" className={buttonClasses({ variant: "ghost", size: "sm" })} onClick={() => onEdit(book)}>
                      Editar
                    </button>
                    <button
                      type="button"
                      className={buttonClasses({ variant: "danger-ghost", size: "sm" })}
                      onClick={() => onDelete(book)}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Card>
  );
}
