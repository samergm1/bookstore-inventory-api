export const normalizeIsbn = (value = "") => value.replace(/[-\s]/g, "").toUpperCase();

// Valid ISBN: 10 or 13 digits, ISBN-10 can end in X.
export function isValidIsbn(value) {
  if (!value || !/^[0-9Xx\-\s]+$/.test(value)) return false;
  const digits = normalizeIsbn(value);
  if (digits.length === 13) return /^\d{13}$/.test(digits);
  if (digits.length === 10) return /^\d{9}[\dX]$/.test(digits);
  return false;
}

const normalizeDecimal = (value) => String(value ?? "").trim().replace(",", ".");

export function validateBook(values) {
  const errors = {};

  const required = {
    title: "El título es obligatorio.",
    author: "El autor es obligatorio.",
    category: "La categoría es obligatoria.",
  };
  Object.entries(required).forEach(([field, message]) => {
    if (!String(values[field] ?? "").trim()) errors[field] = message;
  });

  const isbn = String(values.isbn ?? "").trim();
  if (!isbn) errors.isbn = "El ISBN es obligatorio.";
  else if (!isValidIsbn(isbn)) {
    errors.isbn = "Debe tener 10 o 13 dígitos (se permiten guiones). En ISBN-10 el último puede ser X.";
  }

  const cost = normalizeDecimal(values.cost_usd);
  if (!cost) errors.cost_usd = "El costo es obligatorio.";
  else if (cost.startsWith("-")) errors.cost_usd = "Debe ser mayor a 0.";
  else if (!/^\d+(\.\d{1,2})?$/.test(cost)) errors.cost_usd = "Número válido con máximo 2 decimales (ej. 15.99).";
  else if (Number(cost) <= 0) errors.cost_usd = "Debe ser mayor a 0.";
  else if (Number(cost) >= 1e8) errors.cost_usd = "El valor es demasiado grande.";

  const stock = String(values.stock_quantity ?? "").trim();
  if (!stock) errors.stock_quantity = "El stock es obligatorio.";
  else if (!/^\d+$/.test(stock)) errors.stock_quantity = "Debe ser un número entero mayor o igual a 0.";

  const country = String(values.supplier_country ?? "").trim();
  if (!/^[A-Za-z]{2}$/.test(country)) errors.supplier_country = "Código ISO de 2 letras (ej. ES, US, CO).";

  return errors;
}

// Converts form values to JSON structure
export function toBookPayload(values) {
  return {
    title: values.title.trim(),
    author: values.author.trim(),
    isbn: values.isbn.trim(),
    cost_usd: Number(normalizeDecimal(values.cost_usd)),
    stock_quantity: Number.parseInt(values.stock_quantity, 10),
    category: values.category.trim(),
    supplier_country: values.supplier_country.trim().toUpperCase(),
  };
}
