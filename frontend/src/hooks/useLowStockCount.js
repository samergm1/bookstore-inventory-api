import { useEffect, useState } from "react";
import { booksApi } from "../api/booksApi";
import { isCanceled } from "../api/httpClient";

/** Total books with stock */
export function useLowStockCount(threshold, refreshKey) {
  const [count, setCount] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    booksApi
      .lowStock({ threshold, page: 1, pageSize: 1, signal: controller.signal })
      .then((data) => setCount(data.count))
      .catch((error) => {
        if (!isCanceled(error)) setCount(null);
      });
    return () => controller.abort();
  }, [threshold, refreshKey]);

  return count;
}
