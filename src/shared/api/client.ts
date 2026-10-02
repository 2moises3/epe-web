import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Cache-Control": "no-store",
    Pragma: "no-cache",
  },
});

// TODO: agregar un interceptor de request que adjunte el bearer token
// una vez exista el flujo de auth (aún no hay mecanismo de token en el codebase).

apiClient.interceptors.response.use(
  (response) => {
    if (typeof response.data === "string" && response.data.trim().toLowerCase().startsWith("<!doctype html>")) {
      return Promise.reject(new Error("El servidor no respondió datos válidos (API no conectada)."));
    }
    return response;
  },
  (error) => Promise.reject(error.response?.data ?? error),
);
