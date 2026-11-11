import { useState } from "react";
import { booksApi } from "../../api/booksApi";
import { useToast } from "../../context/ToastContext";
import ConfirmDialog from "../ui/ConfirmDialog";

export default function DeleteBookDialog({ book, onClose, onDeleted }) {
  const toast = useToast();
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await booksApi.remove(book.id);
      toast.success(`«${book.title}» fue eliminado del inventario.`, "Libro eliminado");
      onDeleted?.(book);
    } catch (error) {
      toast.apiError(error);
      if (error.status === 404) onDeleted?.(book);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ConfirmDialog
      open={Boolean(book)}
      title="Eliminar libro"
      danger
      loading={deleting}
      confirmLabel="Sí, eliminar"
      onConfirm={handleConfirm}
      onCancel={onClose}
      message={
        <p>
          ¿Seguro que deseas eliminar{" "}
          <strong className="text-slate-900 dark:text-slate-100">«{book?.title}»</strong> (ISBN {book?.isbn})?
          <br />
          Esta acción no se puede deshacer.
        </p>
      }
    />
  );
}
