import { useState } from "react"
import api from "../services/api"
import { useNavigate } from "react-router-dom"

export default function Login(){

  const [username,setUsername] = useState("")
  const [password,setPassword] = useState("")
  const navigate = useNavigate()

  const handleLogin = () => {
    api.post("/login", { username, password })
      .then(res => {
        localStorage.setItem("token", res.data.token)
        localStorage.setItem("role", res.data.role)
        navigate("/")
      })
      .catch(() => {
        alert("Credenciales incorrectas")
      })
  }

  // 🔥 LOGIN RÁPIDO (SOLO DESARROLLO)
  const loginAs = (role) => {
    const fakeToken = btoa(JSON.stringify({ role }))
    const token = `fake.${fakeToken}.fake`

    localStorage.setItem("token", token)
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">

      <div className="bg-gray-800 p-6 rounded-xl w-80">

        <h2 className="text-xl mb-4 text-center">🔐 Login</h2>

        <input
          placeholder="Usuario"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="w-full mb-3 p-2 rounded bg-gray-700"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full mb-3 p-2 rounded bg-gray-700"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-green-500 hover:bg-green-600 p-2 rounded font-bold"
        >
          Entrar
        </button>

        {/* 🔥 BOTONES DEV */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => loginAs("admin")}
            className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded"
          >
            Admin
          </button>

          <button
            onClick={() => loginAs("garzon")}
            className="w-full bg-yellow-600 hover:bg-yellow-700 p-2 rounded"
          >
            Garzón
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-2 text-center">
          Modo desarrollo
        </p>

      </div>

    </div>
  )
}