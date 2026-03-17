import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { API } from "../services/api"

export default function Payment(){

  const { orderId } = useParams()
  const navigate = useNavigate()

  const [items,setItems] = useState([])

  useEffect(()=>{

    API.get(`/order-items/${orderId}`)
      .then(res=>{
        setItems(res.data)
      })

  },[])

  const total = items.reduce((acc,item)=>{
    return acc + item.qty * item.price
  },0)

  const payOrder = async () => {

    try {

      await API.post("/pay-order", {
        order_id: orderId
      })

      alert("✅ Pago realizado")

      // 🔥 navegación limpia a mesas
      setTimeout(() => {
        navigate("/tables")
      }, 800)

    } catch (error) {

      console.error(error)
      alert("❌ Error al procesar pago")

    }

  }

  return (
    <div>

      {/* 🔥 HEADER */}
      <div className="bg-gray-950 border-b border-gray-800 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-green-400">
          🍺 Pub POS
        </h1>
        <div className="text-sm text-gray-400">
          Pago
        </div>
      </div>

      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">

        <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md">

          {/* TITULO */}
          <h1 className="text-2xl font-bold mb-6 text-center">
            💰 Pago
          </h1>

          {/* RESUMEN */}
          <div className="mb-6 max-h-40 overflow-y-auto">

            {items.map(item => (
              <div key={item.id} className="flex justify-between text-sm mb-2">
                <span>{item.name} x{item.qty}</span>
                <span>${(item.qty * item.price).toLocaleString()}</span>
              </div>
            ))}

          </div>

          {/* TOTAL */}
          <div className="text-center mb-6">
            <p className="text-gray-400">Total a pagar</p>
            <h2 className="text-4xl font-bold text-green-400">
              ${total.toLocaleString()}
            </h2>
          </div>

          {/* BOTONES */}
          <div className="flex flex-col gap-4">

            <button
              onClick={payOrder}
              className="bg-green-500 hover:bg-green-600 p-4 rounded-xl text-lg font-bold"
            >
              💵 Efectivo
            </button>

            <button
              onClick={payOrder}
              className="bg-blue-500 hover:bg-blue-600 p-4 rounded-xl text-lg font-bold"
            >
              💳 Tarjeta
            </button>

            <button
              onClick={payOrder}
              className="bg-purple-500 hover:bg-purple-600 p-4 rounded-xl text-lg font-bold"
            >
              🔀 Mixto
            </button>

          </div>

          {/* VOLVER */}
          <button
            onClick={() => navigate(-1)}
            className="mt-6 w-full text-gray-400 hover:text-white"
          >
            ← Volver
          </button>

        </div>

      </div>

    </div>
  )
}