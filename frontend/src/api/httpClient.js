import axios from "axios";


export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/+$/, "");

const DEFAULT_MESSAGES = {
  0: "No se pudo conectar con el servidor.",
  400: "Los datos enviados no son válidos.",
  404: "El recurso solicitado no existe.",
  500: "Error interno del servidor. Inténtalo más tarde.",
  503: "Servicio externo no disponible. Inténtalo más tarde.",
};

export const STATUS_TITLES = {
  0: "Sin conexión",
  400: "Datos inválidos (400)",
  404: "No encontrado (404)",
  500: "Error del servidor (500)",
  503: "Servicio no disponible (503)",
};

export class ApiError extends Error {
  constructor({ status, code, message, details = null }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function isCanceled(error) {
  return axios.isCancel(error);
}

export function firstDetailMessage(details) {
  if (!details) return null;
  if (Array.isArray(details)) return details[0] ?? null;
  if (typeof details === "object") {
    const [field, value] = Object.entries(details)[0] ?? [];
    if (!field) return null;
    const message = Array.isArray(value) ? value[0] : value;
    return field === "non_field_errors" ? message : `${field}: ${message}`;
  }
  return String(details);
}

function toApiError(error) {
  if (error.response) {
    const { status, data } = error.response;
    const body = data && typeof data === "object" ? data.error : null;
    return new ApiError({
      status,
      code: body?.code ?? "http_error",
      message: body?.message || DEFAULT_MESSAGES[status] || `Error inesperado (${status}).`,
      details: body?.details ?? null,
    });
  }
  if (error.code === "ECONNABORTED") {
    return new ApiError({ status: 0, code: "timeout", message: "El servidor tardó demasiado en responder." });
  }
  return new ApiError({ status: 0, code: "network_error", message: DEFAULT_MESSAGES[0] });
}

const http = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

http.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(isCanceled(error) ? error : toApiError(error)),
);

export default http;
