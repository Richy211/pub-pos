import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../services/api"

export default function Payment() {
  const { id } = useParams(); // id de la orden
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get(`/order-items/${id}`)
      .then(res => setItems(res.data))
      .catch(err => console.error("Error cargando items de pago", err));
  }, [id]);

  const total = items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.price)), 0);

  const payOrder = async () => {
    try {
      await api.post("/close-order", { 
      order_id:id});
      alert("✅ Pago realizado con éxito");
      navigate("/tables");
    } catch (error) {
      alert("❌ Error al procesar pago");
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-950 p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-green-400 text-center">Finalizar Pago</h1>
      </div>
      <div className="flex items-center justify-center p-10">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md">
          <div className="mb-6 space-y-2">
            {items.map(item => (
              <div key={item.id} className="flex justify-between text-sm border-b border-gray-700 pb-1">
                <span>{item.name} x{item.quantity}</span>
                <span>${(item.quantity * item.price).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="text-center mb-8">
            <p className="text-gray-400">Total a pagar</p>
            <h2 className="text-5xl font-bold text-green-400">${total.toLocaleString()}</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <button onClick={payOrder} className="bg-green-500 hover:bg-green-600 p-4 rounded-xl font-bold text-lg">💵 Efectivo</button>
            <button onClick={payOrder} className="bg-blue-500 hover:bg-blue-600 p-4 rounded-xl font-bold text-lg">💳 Tarjeta</button>
            <button onClick={() => navigate(-1)} className="text-gray-400 mt-4 hover:underline">Volver a la orden</button>
          </div>
        </div>
      </div>
    </div>
  )
}