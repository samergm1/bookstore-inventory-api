import http from "./httpClient";


export const booksApi = {
  list: ({ page, pageSize, signal } = {}) =>
    http.get("/books", { params: { page, page_size: pageSize }, signal }).then((r) => r.data),

  searchByCategory: ({ category, page, pageSize, signal } = {}) =>
    http
      .get("/books/search", { params: { category, page, page_size: pageSize }, signal })
      .then((r) => r.data),

  lowStock: ({ threshold, page, pageSize, signal } = {}) =>
    http
      .get("/books/low-stock", { params: { threshold, page, page_size: pageSize }, signal })
      .then((r) => r.data),

  get: (id, { signal } = {}) => http.get(`/books/${id}`, { signal }).then((r) => r.data),

  create: (data) => http.post("/books", data).then((r) => r.data),

  update: (id, data) => http.put(`/books/${id}`, data).then((r) => r.data),

  remove: (id) => http.delete(`/books/${id}`),

  calculatePrice: (id) => http.post(`/books/${id}/calculate-price`).then((r) => r.data),
};
