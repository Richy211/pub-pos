/* import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api"
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api; */

import axios from "axios";

const api = axios.create({
  // Si existe la variable en Netlify, usa esa. Si no, usa localhost para desarrollo.
  baseURL: import.meta.env.VITE_SUPABASE_URL 
    ? `${import.meta.env.VITE_SUPABASE_URL}/rest/v1` 
    : "http://localhost:5000/api"
});

// Esto es para que Supabase reconozca tus peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  
  // Agregamos la API Key de Supabase si estamos en producción
  if (import.meta.env.VITE_SUPABASE_ANON_KEY) {
    config.headers.apikey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;