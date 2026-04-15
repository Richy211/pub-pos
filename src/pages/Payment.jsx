import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { generateTicket } from "../services/ticketGenerator";
import { toast } from "react-hot-toast";

export default function Payment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    api.get(`/order-items/${id}`)
      .then(res => setItems(res.data))
      .catch(err => console.error("Error cargando items", err));
  }, [id]);

  const total = items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.price)), 0);

  const handlePayment = async () => {
    try {
      // 1. Guardar en base de datos
      await api.post("/close-order", { order_id: id });
      toast.success("Pago registrado correctamente");
      
      // 2. Mostrar la pregunta de impresión
      setShowModal(true);
    } catch (error) {
      alert("❌ Error al procesar pago");
    }
  };

const handlePrintAndFinish = () => {
    let waiterName = "Garzón";
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        waiterName = payload.username || "Admin";
      }
    } catch (e) {}

    // 1. DISPARAR DESCARGA (Ahora no bloquea la pestaña)
    generateTicket({ order_id: id, items, total, waiter: waiterName });
    
    // 2. AVISAR Y SALIR INMEDIATAMENTE
    toast.success("Descargando ticket...");
    navigate("/tables");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
        <h2 className="text-gray-400 mb-2">Total de la cuenta</h2>
        <h1 className="text-5xl font-bold text-green-400 mb-8">${total.toLocaleString()}</h1>
        
        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={handlePayment} 
            className="bg-green-500 hover:bg-green-600 p-5 rounded-2xl font-bold text-xl transition-all"
          >
            💵 Registrar Pago
          </button>
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-white mt-4 transition-colors">
            Cancelar y volver
          </button>
        </div>
      </div>

      {/* MODAL DE CONFIRMACIÓN DE TICKET */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-gray-800 border border-gray-700 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-white mb-2">¡Venta Finalizada!</h3>
            <p className="text-gray-400 mb-8">El pago se registró. ¿Necesitas el ticket impreso?</p>
            
            <div className="flex flex-col gap-4">
              <button 
                onClick={handlePrintAndFinish}
                className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2"
              >
                <span>📄</span> Imprimir y Salir
              </button>
              
              <button 
                onClick={() => navigate("/tables")}
                className="bg-transparent border border-gray-600 text-gray-400 hover:text-white p-3 rounded-2xl font-semibold"
              >
                No imprimir, solo salir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}