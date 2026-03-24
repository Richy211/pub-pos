import { useState } from "react"
import { API } from "../services/api"
import { useNavigate } from "react-router-dom"

export default function Login(){

  const [username,setUsername] = useState("")
  const [password,setPassword] = useState("")
  const navigate = useNavigate()

  const handleLogin = () => {
    API.post("/login", { username, password })
      .then(res => {

        localStorage.setItem("token", res.data.token)
        localStorage.setItem("role", res.data.role)

        navigate("/")
      })
      .catch(() => {
        alert("Credenciales incorrectas")
      })
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

      </div>

    </div>
  )
}