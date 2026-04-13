import { useState } from "react";
import api from "../services/api";

// IMPORTANTE: Aquí arriba DEBE decir { data, onDelete }
export default function PurchaseTable({ data, onDelete }) {
  const [selectedDetails, setSelectedDetails] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchDetails = async (id) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/compras-detalle/${id}`);
      setSelectedDetails(res.data);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Error al cargar el detalle:", err);
      alert("No se pudo cargar el detalle.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-x-auto bg-gray-900/50 rounded-b-xl border border-gray-700">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-gray-400 border-b border-gray-700 bg-gray-800/50 text-xs uppercase tracking-wider">
            <th className="p-4">ID</th>
            <th className="p-4">Fecha</th>
            <th className="p-4">Proveedor</th>
            <th className="p-4">Productos</th>
            <th className="p-4 text-right">Total</th>
            <th className="p-4 text-center">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {data && data.length > 0 ? (
            data.map((h) => (
              <tr key={h.id} className="hover:bg-gray-800/40 transition-colors">
                <td className="p-4 font-mono text-gray-500 text-xs">#{h.id}</td>
                <td className="p-4 text-sm text-gray-300">
                  {new Date(h.date).toLocaleDateString('es-CL')}
                </td>
                <td className="p-4 font-bold text-blue-300">{h.proveedor_nombre || "S/N"}</td>
                <td className="p-4 text-xs text-gray-400 italic truncate max-w-xs">
                  {h.productos_comprados || "Ver detalle..."}
                </td>
                <td className="p-4 text-right font-bold text-green-400 font-mono">
                  ${Number(h.total || 0).toLocaleString('es-CL')}
                </td>
                <td className="p-4 text-center flex items-center justify-center gap-2">
                  {/* BOTÓN VER */}
                  <button 
                    onClick={() => fetchDetails(h.id)}
                    className="bg-amber-500 hover:bg-amber-600 text-black font-black px-3 py-1 rounded text-[10px] shadow-lg"
                  >
                    👁️
                  </button>
                  
                  {/* BOTÓN ELIMINAR - Ahora sí reconocerá onDelete */}
                  <button 
                    onClick={() => onDelete(h.id)}
                    className="bg-red-600 hover:bg-red-700 text-white font-black px-3 py-1 rounded text-[10px] shadow-lg transition-all"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="p-10 text-center text-gray-500 italic">No hay compras.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* MODAL (Se mantiene igual) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-[9999] p-4 backdrop-blur-md">
          <div className="bg-gray-800 border-2 border-amber-500 p-6 rounded-2xl max-w-xl w-full">
            <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
               <h3 className="text-xl font-bold text-amber-500 uppercase">Detalle</h3>
               <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white text-3xl">&times;</button>
            </div>
            <table className="w-full text-sm text-left">
              <thead><tr className="text-gray-400 border-b border-gray-700 text-xs"><th>Producto</th><th className="text-center">Cant.</th><th className="text-right">Precio</th></tr></thead>
              <tbody>
                {selectedDetails.map((det, i) => (
                  <tr key={i} className="border-b border-gray-750">
                    <td className="py-2">{det.name}</td>
                    <td className="py-2 text-center font-bold text-blue-400">{det.quantity}</td>
                    <td className="py-2 text-right">${Number(det.price || 0).toLocaleString('es-CL')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={() => setIsModalOpen(false)} className="w-full mt-6 bg-amber-500 text-black py-2 rounded font-bold uppercase">Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}