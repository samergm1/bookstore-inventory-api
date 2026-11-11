import { useEffect, useState } from "react";
import { booksApi } from "../api/booksApi";
import { isCanceled } from "../api/httpClient";

/** Load the books page according to the active filters */
export function useBooks({ page, pageSize, category, lowStock, threshold, refreshKey }) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  useEffect(() => {
    const controller = new AbortController();
    const params = { page, pageSize, signal: controller.signal };

    setState((prev) => ({ ...prev, loading: true, error: null }));

    const request = lowStock
      ? booksApi.lowStock({ ...params, threshold })
      : category
        ? booksApi.searchByCategory({ ...params, category })
        : booksApi.list(params);

    request
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((error) => {
        if (!isCanceled(error)) setState((prev) => ({ ...prev, loading: false, error }));
      });

    return () => controller.abort();
  }, [page, pageSize, category, lowStock, threshold, refreshKey]);

  return state;
}
