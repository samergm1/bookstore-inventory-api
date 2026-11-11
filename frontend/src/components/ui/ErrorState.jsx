import { STATUS_TITLES } from "../../api/httpClient";
import Button from "./Button";
import Card from "./Card";

/** Error block for when a view fails to load its data */
export default function ErrorState({ error, title, onRetry }) {
  return (
    <Card role="alert" className="flex flex-col items-center gap-2.5 py-12 text-center">
      <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
        {title || STATUS_TITLES[error?.status] || "Ocurrió un error"}
      </h3>
      <p className="text-slate-600 dark:text-slate-300">{error?.message}</p>
      {onRetry && <Button onClick={onRetry}>Reintentar</Button>}
    </Card>
  );
}
