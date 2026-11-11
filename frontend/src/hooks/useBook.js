import { useCallback, useEffect, useState } from "react";
import { booksApi } from "../api/booksApi";
import { isCanceled } from "../api/httpClient";

/** Loads a book by id */
export function useBook(id) {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    booksApi
      .get(id, { signal: controller.signal })
      .then((data) => {
        setBook(data);
        setLoading(false);
      })
      .catch((err) => {
        if (isCanceled(err)) return;
        setError(err);
        setLoading(false);
      });
    return () => controller.abort();
  }, [id, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return { book, setBook, loading, error, reload };
}
