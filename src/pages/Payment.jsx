// ============================================================
//  src/pages/Payment.jsx  — con integración boleta electrónica
// ============================================================
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

  // ── NUEVO: datos de la boleta que devuelve el backend ──────
  const [boleta, setBoleta] = useState(null);

  useEffect(() => {
    api.get(`/order-items/${id}`)
      .then(res => setItems(res.data))
      .catch(err => {
        console.error("Error cargando items", err);
        toast.error("No se pudieron cargar los productos");
      });
  }, [id]);

  const total = items.reduce(
    (acc, item) => acc + (Number(item.quantity) * Number(item.price)), 0
  );

  // ── PAGO (con boleta) ──────────────────────────────────────
  const handlePayment = async () => {
    try {
      const response = await api.post(`/orders/${id}/pay`, {
        metodo_pago: metodoPago,
        total
      });

      if (response.status === 200) {
        // Guardar datos de boleta recibidos desde el backend
        setBoleta(response.data.boleta || null);
        setShowModal(true);
        toast.success("Pago registrado correctamente");
      }
    } catch (error) {
      console.error("Error en el proceso de pago:", error);
      toast.error("Hubo un error al procesar el pago");
    }
  };

  // ── TICKET LOCAL (PDF descargable) ────────────────────────
  const handlePrintAndFinish = () => {
    let waiterName = "Garzón";
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        waiterName = payload.username || "Admin";
      }
    } catch (e) {
      console.error("Error al obtener nombre del garzón", e);
    }

    generarPDF({ orderId: id, items, total, waiter: waiterName });
    toast.success("Descargando ticket...");

    setTimeout(() => navigate("/tables"), 1000);
  };

  // ── ABRIR BOLETA EN PDF (Bsale) ───────────────────────────
  const handleVerBoleta = () => {
    const url = boleta?.urlPdf || boleta?.urlPublic;
    if (url) {
      window.open(url, "_blank");
    } else {
      toast("Boleta registrada en modo DEMO — no hay PDF disponible.", {
        icon: "ℹ️"
      });
    }
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

      {/* ── MODAL POST-PAGO (con sección de boleta electrónica) ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-gray-800 border border-gray-700 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-white mb-2">¡Venta Finalizada!</h3>
            <p className="text-gray-400 mb-4">El pago se registró con éxito.</p>

            {/* ── Sección boleta electrónica ── */}
            {boleta && (
              <div className={`mb-6 p-3 rounded-xl text-sm ${
                boleta.modo === "DEMO"
                  ? "bg-yellow-900/40 border border-yellow-600 text-yellow-300"
                  : "bg-green-900/40 border border-green-600 text-green-300"
              }`}>
                {boleta.modo === "DEMO" ? (
                  <>
                    <p className="font-bold mb-1">🧪 Boleta simulada (DEMO)</p>
                    <p className="text-yellow-400/80 text-xs">{boleta.mensaje}</p>
                  </>
                ) : (
                  <>
                    <p className="font-bold mb-1">🧾 Boleta Electrónica emitida</p>
                    <p>N° <span className="font-mono font-bold">{boleta.numero}</span></p>
                  </>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3">
              {/* Botón boleta PDF (solo si hay datos de Bsale) */}
              {boleta && (
                <button
                  onClick={handleVerBoleta}
                  className="bg-purple-600 hover:bg-purple-500 text-white p-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all"
                >
                  🧾 {boleta.urlPdf ? "Ver Boleta Electrónica" : "Boleta registrada (DEMO)"}
                </button>
              )}

              <button
                onClick={handlePrintAndFinish}
                className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all"
              >
                📄 Ticket interno y salir
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
