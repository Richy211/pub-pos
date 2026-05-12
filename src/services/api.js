import axios from "axios";

const api = axios.create({
  // Si estamos en desarrollo usa localhost, si no, usa la URL de tu backend real
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

// Agregamos un interceptor por si acaso manejas tokens en el futuro
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;