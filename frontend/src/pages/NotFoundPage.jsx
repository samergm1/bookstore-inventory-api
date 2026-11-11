import { Link } from "react-router-dom";
import { buttonClasses } from "../components/ui/Button";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <h1 className="text-2xl font-bold tracking-tight">Página no encontrada</h1>
      <p className="text-slate-500 dark:text-slate-400">La ruta que buscas no existe.</p>
      <Link to="/" className={buttonClasses({ variant: "primary" })}>
        Ir al inventario
      </Link>
    </div>
  );
}
