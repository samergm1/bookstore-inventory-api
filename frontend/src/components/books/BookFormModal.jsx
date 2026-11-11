import { useState } from "react";
import { booksApi } from "../../api/booksApi";
import { STATUS_TITLES } from "../../api/httpClient";
import { useToast } from "../../context/ToastContext";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import BookForm, { bookToFormValues } from "./BookForm";

const FORM_ID = "book-form";

export default function BookFormModal({ open, book, onClose, onSaved }) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(book);

  const handleSubmit = async (payload) => {
    setSaving(true);
    try {
      const saved = isEdit ? await booksApi.update(book.id, payload) : await booksApi.create(payload);
      toast.success(
        `«${saved.title}» se ${isEdit ? "actualizó" : "creó"} correctamente.`,
        isEdit ? "Libro actualizado" : "Libro creado",
      );
      onSaved?.(saved);
    } catch (error) {
      if (error.status === 400) toast.error("Revisa los campos marcados en el formulario.", STATUS_TITLES[400]);
      else toast.apiError(error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={isEdit ? "Editar libro" : "Nuevo libro"}
      onClose={onClose}
      closeDisabled={saving}
      footer={
        <>
          <Button onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} variant="primary" loading={saving}>
            {isEdit ? "Guardar cambios" : "Crear libro"}
          </Button>
        </>
      }
    >
      <BookForm key={book?.id ?? "new"} id={FORM_ID} initialValues={bookToFormValues(book)} onSubmit={handleSubmit} disabled={saving} />
    </Modal>
  );
}
