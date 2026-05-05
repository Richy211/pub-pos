import { useState } from "react";
import api from "../services/api";
import axios from "axios"; // Importamos axios base para la ruta de auth

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      // Definimos la base de la URL de Supabase
      const baseUrl = import.meta.env.VITE_SUPABASE_URL || "https://wkgjtpqdzzipovkiqzrb.supabase.co";
      const authUrl = `${baseUrl}/auth/v1/token?grant_type=password`;

      // En Supabase el 'username' DEBE ser un email (ej: admin@pub.com)
      const response = await axios.post(authUrl, {
        email: username, 
        password: password
      }, {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || "TU_ANON_KEY_MANUAL_AQUI",
          'Content-Type': 'application/json'
        }
      });

      if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error detallado:", error.response?.data || error.message);
      alert("Error: Revisa que el usuario sea un EMAIL y que exista en Supabase.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-6 rounded-xl w-80 shadow-2xl border border-gray-700">
        <h2 className="text-xl mb-4 text-center font-bold">🔐 Pub POS Login</h2>
        <input
          placeholder="Email del usuario"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="w-full mb-3 p-2 rounded bg-gray-700 border border-gray-600 focus:border-green-500 outline-none"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full mb-3 p-2 rounded bg-gray-700 border border-gray-600 focus:border-green-500 outline-none"
        />
        <button
          onClick={handleLogin}
          className="w-full bg-green-600 hover:bg-green-700 p-2 rounded font-bold transition-colors"
        >
          Entrar
        </button>
      </div>
    </div>
  );
}