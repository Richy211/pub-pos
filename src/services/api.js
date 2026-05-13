import axios from "axios";

/**
 * RECUERDA: 
 * Si usas 'localhost', solo funciona en TU PC.
 * Para que tu hijo lo vea, reemplaza 'localhost' por tu IP (ej: 192.168.1.15).
 */
const api = axios.create({
baseURL: import.meta.env.VITE_API_URL + "/api"
});

// Interceptor para manejar el token (útil si luego agregas login)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;