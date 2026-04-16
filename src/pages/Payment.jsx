import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { generarPDF } from '../services/ticketGenerator';
import { toast } from "react-hot-toast";

export default function Payment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [metodoPago, setMetodoPago] = useState("efectivo");

  // Cargar los items de la orden al montar el componente
  useEffect(() => {
    api.get(`/order-items/${id}`)
      .then(res => setItems(res.data))
      .catch(err => {
        console.error("Error cargando items", err);
        toast.error("No se pudieron cargar los productos");
      });
  }, [id]);

  // Cálculo del total
  const total = items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.price)), 0);

  // Función principal para registrar el pago
  const handlePayment = async () => {
    try {
      const response = await api.post(`/orders/${id}/pay`, {
        metodo_pago: metodoPago,
        total: total
      });

      if (response.status === 200) {
        setShowModal(true); 
        toast.success("Pago registrado correctamente");
      }
    } catch (error) {
      console.error("Error en el proceso de pago:", error);
      toast.error("Hubo un error al procesar el pago");
    }
  };

  // Función para generar ticket y finalizar
  const handlePrintAndFinish = () => {
    let waiterName = "Garzón";
    try {
      const token = localStorage.getItem("token");
      if (token) {
        // Decodificar el nombre del usuario desde el token JWT
        const payload = JSON.parse(atob(token.split(".")[1]));
        waiterName = payload.username || "Admin";
      }
    } catch (e) {
      console.error("Error al obtener nombre del garzón", e);
    }

    // Disparar la generación del PDF con la data necesaria
    generarPDF({ 
      orderId: id, 
      items, 
      total, 
      waiter: waiterName 
    });
    
    toast.success("Descargando ticket...");
    
    // Pequeña pausa para asegurar la descarga antes de navegar
    setTimeout(() => {
      navigate("/tables");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
        <h2 className="text-gray-400 mb-2">Total de la cuenta</h2>
        <h1 className="text-5xl font-bold text-green-400 mb-8">
          ${total.toLocaleString('es-CL')}
        </h1>
        
        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={handlePayment} 
            className="bg-green-500 hover:bg-green-600 p-5 rounded-2xl font-bold text-xl transition-all shadow-lg active:scale-95"
          >
            💵 Registrar Pago
          </button>
          
          <button 
            onClick={() => navigate(-1)} 
            className="text-gray-500 hover:text-white mt-2 transition-colors"
          >
            Cancelar y volver
          </button>
        </div>
      </div>

      {/* MODAL DE CONFIRMACIÓN POST-PAGO */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-gray-800 border border-gray-700 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-white mb-2">¡Venta Finalizada!</h3>
            <p className="text-gray-400 mb-8">El pago se registró con éxito. ¿Deseas el ticket?</p>
            
            <div className="flex flex-col gap-4">
              <button 
                onClick={handlePrintAndFinish}
                className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all"
              >
                📄 Imprimir y Salir
              </button>
              
              <button 
                onClick={() => navigate("/tables")}
                className="bg-transparent border border-gray-600 text-gray-400 hover:text-white p-3 rounded-2xl font-semibold transition-all"
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