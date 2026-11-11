import { useState } from "react";
import { booksApi } from "../../api/booksApi";
import { useToast } from "../../context/ToastContext";
import { cn } from "../../utils/cn";
import { formatDateTime, formatMoney, formatNumber } from "../../utils/format";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Card from "../ui/Card";
import InlineError from "../ui/InlineError";
import Spinner from "../ui/Spinner";

const SOURCE_INFO = {
  api: { label: "Tasa en tiempo real", tone: "success" },
  cache: { label: "Tasa reciente (caché 10 min)", tone: "info" },
  default: { label: "Tasa por defecto (API externa no disponible)", tone: "warning" },
};

function BreakdownRow({ label, children, total = false }) {
  return (
    <div className={cn("flex justify-between gap-4 px-4 py-3", total && "bg-indigo-50 dark:bg-indigo-950/50")}>
      <dt className={total ? "font-bold text-slate-900 dark:text-slate-100" : "text-slate-500 dark:text-slate-400"}>{label}</dt>
      <dd className={cn("text-right font-semibold tabular-nums", total && "text-xl text-indigo-600 dark:text-indigo-400")}>
        {children}
      </dd>
    </div>
  );
}

export default function PriceCalculator({ book, onCalculated }) {
  const toast = useToast();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await booksApi.calculatePrice(book.id);
      setResult(data);
      onCalculated?.(data);
      toast.success(`Precio sugerido: ${formatMoney(data.selling_price_local, data.currency)}`, "Precio calculado");
      if (data.exchange_rate_source === "default") {
        toast.warning("La API de tasas de cambio no respondió; se usó una tasa por defecto.");
      }
    } catch (err) {
      setError(err);
      toast.apiError(err);
    } finally {
      setLoading(false);
    }
  };

  const source = result ? SOURCE_INFO[result.exchange_rate_source] ?? SOURCE_INFO.api : null;
  const profit = result ? result.selling_price_local - result.cost_local : 0;

  return (
    <Card aria-live="polite">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Precio de venta sugerido</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Convierte el costo a la moneda local con la tasa de cambio actual y aplica el margen de ganancia.
          </p>
        </div>
        <Button variant="primary" loading={loading} onClick={handleCalculate}>
          {result ? "Recalcular" : "Calcular precio de venta"}
        </Button>
      </header>

      {loading && !result && (
        <div className="flex items-center gap-2.5 py-4 text-slate-500">
          <Spinner /> Consultando tasa de cambio…
        </div>
      )}

      {error && !loading && <InlineError>{error.message}</InlineError>}

      {result ? (
        <div className={cn("transition-opacity", loading && "opacity-50")}>
          <dl
            data-testid="price-breakdown"
            className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 text-sm dark:divide-slate-800 dark:border-slate-800"
          >
            <BreakdownRow label="Costo original">{formatMoney(result.cost_usd, "USD")}</BreakdownRow>
            <BreakdownRow label="Tasa de cambio aplicada">
              1 USD = {formatNumber(result.exchange_rate)} {result.currency}
            </BreakdownRow>
            <BreakdownRow label="Costo en moneda local">{formatMoney(result.cost_local, result.currency)}</BreakdownRow>
            <BreakdownRow label="Margen de ganancia">
              {formatNumber(result.margin_percentage, 2)}%{" "}
              <span className="text-xs font-normal text-slate-500">(+{formatMoney(profit, result.currency)})</span>
            </BreakdownRow>
            <BreakdownRow label="Precio de venta final" total>
              {formatMoney(result.selling_price_local, result.currency)}
            </BreakdownRow>
          </dl>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <Badge tone={source.tone}>{source.label}</Badge>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Calculado: {formatDateTime(result.calculation_timestamp)}
            </span>
          </div>
        </div>
      ) : (
        !loading && (
          <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
            {book.selling_price_local == null
              ? "Este libro aún no tiene precio de venta. Pulsa el botón para calcularlo."
              : `Último precio calculado: ${formatMoney(book.selling_price_local, book.currency)}. Pulsa el botón para recalcular con la tasa actual.`}
          </p>
        )
      )}
    </Card>
  );
}
