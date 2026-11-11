import { useMemo, useState } from "react";
import { toBookPayload, validateBook } from "../../utils/validators";
import Field from "../ui/Field";
import InlineError from "../ui/InlineError";
import Input from "../ui/Input";

const EMPTY_VALUES = {
  title: "",
  author: "",
  isbn: "",
  cost_usd: "",
  stock_quantity: "0",
  category: "",
  supplier_country: "",
};

const COUNTRY_SUGGESTIONS = [
  ["ES", "España"], ["US", "Estados Unidos"], ["GB", "Reino Unido"], ["FR", "Francia"],
  ["DE", "Alemania"], ["IT", "Italia"], ["PT", "Portugal"], ["MX", "México"],
  ["CO", "Colombia"], ["AR", "Argentina"], ["CL", "Chile"], ["PE", "Perú"],
  ["BR", "Brasil"], ["CA", "Canadá"], ["JP", "Japón"],
];

export function bookToFormValues(book) {
  if (!book) return EMPTY_VALUES;
  return {
    title: book.title,
    author: book.author,
    isbn: book.isbn,
    cost_usd: String(book.cost_usd),
    stock_quantity: String(book.stock_quantity),
    category: book.category,
    supplier_country: book.supplier_country,
  };
}

function toFieldErrors(details) {
  if (!details || typeof details !== "object" || Array.isArray(details)) return {};
  return Object.fromEntries(
    Object.entries(details).map(([field, messages]) => [field, Array.isArray(messages) ? messages.join(" ") : String(messages)]),
  );
}

export default function BookForm({ id = "book-form", initialValues = EMPTY_VALUES, onSubmit, disabled = false }) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState({});

  const clientErrors = useMemo(() => validateBook(values), [values]);

  const errorFor = (name) => ((touched[name] || submitted) && clientErrors[name]) || serverErrors[name] || null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (serverErrors[name]) setServerErrors(({ [name]: _removed, ...rest }) => rest);
  };

  const handleBlur = (event) => setTouched((prev) => ({ ...prev, [event.target.name]: true }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (Object.keys(clientErrors).length > 0) return;
    try {
      await onSubmit(toBookPayload(values));
    } catch (error) {
      if (error?.status === 400) setServerErrors(toFieldErrors(error.details));
    }
  };

  const fieldProps = (name, label, extra = {}) => {
    const error = errorFor(name);
    return {
      field: { label, htmlFor: `book-${name}`, error, errorId: `book-${name}-error`, ...extra },
      input: {
        id: `book-${name}`,
        name,
        value: values[name],
        onChange: handleChange,
        onBlur: handleBlur,
        invalid: Boolean(error),
        "aria-describedby": error ? `book-${name}-error` : undefined,
      },
    };
  };

  const title = fieldProps("title", "Título *", { className: "sm:col-span-2" });
  const author = fieldProps("author", "Autor *", { className: "sm:col-span-2" });
  const isbn = fieldProps("isbn", "ISBN *", { hint: "10 o 13 dígitos, ej. 978-84-376-0494-7" });
  const category = fieldProps("category", "Categoría *");
  const cost = fieldProps("cost_usd", "Costo (USD) *", { hint: "Mayor a 0, máx. 2 decimales" });
  const stock = fieldProps("stock_quantity", "Stock *", { hint: "Entero mayor o igual a 0" });
  const country = fieldProps("supplier_country", "País del proveedor *", {
    hint: "Código ISO de 2 letras; define la moneda local",
    className: "sm:col-span-2",
  });

  return (
    <form id={id} onSubmit={handleSubmit} noValidate>
      <fieldset disabled={disabled} className="m-0 grid min-w-0 grid-cols-1 gap-4 border-0 p-0 sm:grid-cols-2">
        {serverErrors.non_field_errors && <InlineError className="sm:col-span-2">{serverErrors.non_field_errors}</InlineError>}

        <Field {...title.field}>
          <Input {...title.input} maxLength={255} autoComplete="off" />
        </Field>

        <Field {...author.field}>
          <Input {...author.input} maxLength={255} autoComplete="off" />
        </Field>

        <Field {...isbn.field}>
          <Input {...isbn.input} maxLength={17} autoComplete="off" className="font-mono" />
        </Field>

        <Field {...category.field}>
          <Input {...category.input} maxLength={100} autoComplete="off" />
        </Field>

        <Field {...cost.field}>
          <Input {...cost.input} inputMode="decimal" placeholder="15.99" />
        </Field>

        <Field {...stock.field}>
          <Input {...stock.input} type="number" min="0" step="1" inputMode="numeric" />
        </Field>

        <Field {...country.field}>
          <Input {...country.input} list="country-suggestions" maxLength={2} placeholder="ES" className="uppercase" />
          <datalist id="country-suggestions">
            {COUNTRY_SUGGESTIONS.map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </datalist>
        </Field>
      </fieldset>
    </form>
  );
}
