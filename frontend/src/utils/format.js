const LOCALE = "es-ES";

export function formatMoney(value, currency = "USD") {
  if (value === null || value === undefined || value === "") return "—";
  try {
    return new Intl.NumberFormat(LOCALE, { style: "currency", currency }).format(Number(value));
  } catch {
    return `${Number(value).toFixed(2)} ${currency}`;
  }
}

export function formatNumber(value, maximumFractionDigits = 6) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat(LOCALE, { maximumFractionDigits }).format(Number(value));
}

export function formatDateTime(iso) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat(LOCALE, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}
