import { useEffect, useState } from "react"
import { API } from "../services/api"
import { useNavigate } from "react-router-dom"

export default function CashClose(){

  const [data,setData] = useState(null)
  const navigate = useNavigate()

  useEffect(()=>{
    API.get("/cash-close")
      .then(res => setData(res.data))
  },[])

  if(!data){
    return <div className="p-6 text-white">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">

      <h1 className="text-3xl font-bold mb-6 text-green-400">
        💰 Cierre de Caja
      </h1>

      <div className="grid grid-cols-2 gap-6">

        <div className="bg-gray-800 p-6 rounded-xl">
          <h2 className="text-lg text-gray-400">Órdenes totales</h2>
          <p className="text-2xl font-bold">{data.total_orders}</p>
        </div>

        <div className="bg-green-600 p-6 rounded-xl">
          <h2 className="text-lg">Pagadas</h2>
          <p className="text-2xl font-bold">{data.paid_orders}</p>
        </div>

        <div className="bg-red-600 p-6 rounded-xl">
          <h2 className="text-lg">Canceladas</h2>
          <p className="text-2xl font-bold">{data.cancelled_orders}</p>
        </div>

        <div className="bg-blue-600 p-6 rounded-xl col-span-2">
          <h2 className="text-lg">Total vendido</h2>
          <p className="text-3xl font-bold">
            ${Number(data.total_sales || 0).toLocaleString()}
          </p>
        </div>

      </div>

      <button
        onClick={() => navigate("/")}
        className="mt-6 bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-xl"
      >
        ⬅ Volver
      </button>

    </div>
  )
}