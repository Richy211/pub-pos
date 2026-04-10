import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    api.post("/login", { username, password })
      .then(res => {
        console.log("LOGIN OK:", res.data);
        localStorage.setItem("token", res.data.token);
        
        // 🚀 CAMBIO CLAVE AQUÍ: 
        // En lugar de navigate("/"), usamos location.href para recargar App.jsx
        window.location.href = "/"; 
      })
      .catch(err => {
        console.error("ERROR LOGIN:", err.response?.data || err.message);
        alert("Error login: Credenciales incorrectas");
      });
  };

  // 🔥 LOGIN RÁPIDO (SOLO DESARROLLO)
  // Este ya lo tenías bien con el reload()
  const loginAs = (role) => {
    const fakeToken = btoa(JSON.stringify({ role }));
    const token = `fake.${fakeToken}.fake`;
    localStorage.setItem("token", token);
    window.location.href = "/"; 
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-6 rounded-xl w-80 shadow-2xl border border-gray-700">
        <h2 className="text-xl mb-4 text-center font-bold">🔐 Pub POS Login</h2>

        <input
          placeholder="Usuario"
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

        <div className="mt-6">
          <p className="text-xs text-gray-500 mb-2 text-center uppercase tracking-widest">Acceso Rápido Dev</p>
          <div className="flex gap-2">
            <button
              onClick={() => loginAs("admin")}
              className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded text-sm"
            >
              Admin
            </button>
            <button
              onClick={() => loginAs("garzon")}
              className="w-full bg-yellow-600 hover:bg-yellow-700 p-2 rounded text-sm"
            >
              Garzón
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}