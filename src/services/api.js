import axios from "axios";

const api = axios.create({
  // Prioridad: Variable de Netlify > URL directa de Supabase
  baseURL: import.meta.env.VITE_SUPABASE_URL 
    ? `${import.meta.env.VITE_SUPABASE_URL}/rest/v1` 
    : "https://wkgjtpqdzzipovkiqzrb.supabase.co/rest/v1"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  // Usamos la anon key para todas las peticiones
  const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "TU_ANON_KEY_MANUAL_AQUI_SI_FALLA_ENV";

  if (apiKey) {
    config.headers.apikey = apiKey;
    config.headers.Authorization = token ? `Bearer ${token}` : `Bearer ${apiKey}`;
  }

  return config;
});

export default api;