import { useState, useEffect } from "react";
import api from "../services/api";

export default function PurchaseTable({ refreshSignal }) {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detalleCompra, setDetalleCompra] = useState(null); // Para el Modal
  const [showModal, setShowModal] = useState(false);

  // 1. Cargar el historial
  const loadCompras = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/compras");
      setCompras(res.data);
    } catch (err) {
      console.error("Error cargando compras:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompras();
  }, [refreshSignal]); // Se recarga cuando guardas una compra nueva

  // 2. Ver detalle de una compra específica (Auditoría)
  const verDetalle = async (id) => {
    try {
      const res = await api.get(`/admin/compras-detalle/${id}`);
      setDetalleCompra(res.data);
      setShowModal(true);
    } catch (err) {
      alert("Error al obtener el detalle");
    }
  };

  // 3. Eliminar (Ojo: esto no resta stock automáticamente, es solo limpieza de registro)
  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este registro de compra? (El stock no se verá afectado)")) return;
    try {
      await api.delete(`/admin/compras/${id}`);
      loadCompras();
    } catch (err) {
      alert("Error al eliminar");
    }
  };

  // Helpers de formato
  const formatCLP = (val) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val);
  const formatDate = (dateStr) => {
    if (!dateStr || dateStr.includes("1969")) return "Fecha pendiente";
    return new Date(dateStr).toLocaleString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <div className="p-4 text-white">Cargando historial...</div>;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-green-500">📋</span> Historial de Adquisiciones
      </h2>

      <div className="overflow-x-auto bg-gray-800 rounded-xl border border-gray-700 shadow-2xl">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-900/50 text-gray-400 text-xs uppercase">
              <th className="p-4">ID</th>
              <th className="p-4">Fecha / Hora</th>
              <th className="p-4">Proveedor</th>
              <th className="p-4">Resumen Productos</th>
              <th className="p-4 text-right">Inversión Total</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {compras.map((c) => (
              <tr key={c.id} className="hover:bg-gray-700/30 transition">
                <td className="p-4 font-mono text-gray-500">#{c.id}</td>
                <td className="p-4 text-sm text-gray-300">{formatDate(c.date)}</td>
                <td className="p-4 font-bold text-blue-400">{c.proveedor_nombre || 'S/P'}</td>
                <td className="p-4 text-xs text-gray-400 max-w-xs truncate italic">
                  {c.productos_comprados}
                </td>
                <td className="p-4 text-right font-bold text-green-400">
                  {formatCLP(c.total)}
                </td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => verDetalle(c.id)} className="p-2 hover:bg-blue-500/20 text-blue-400 rounded transition">👁️</button>
                    <button onClick={() => handleDelete(c.id)} className="p-2 hover:bg-red-500/20 text-red-400 rounded transition">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL DE DETALLE DE COMPRA --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
              <h3 className="text-xl font-bold text-white">Detalle de la Factura</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
            </div>
            
            <div className="p-6">
              <table className="w-full text-left text-gray-300">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-800 uppercase text-[10px] tracking-widest">
                    <th className="pb-3">Producto</th>
                    <th className="pb-3 text-center">Cantidad</th>
                    <th className="pb-3 text-right">Precio Unit.</th>
                    <th className="pb-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {detalleCompra?.map((item, idx) => (
                    <tr key={idx} className="text-sm">
                      <td className="py-3 font-medium text-white">{item.name}</td>
                      <td className="py-3 text-center text-blue-400 font-bold">{item.quantity}</td>
                      <td className="py-3 text-right">{formatCLP(item.price)}</td>
                      <td className="py-3 text-right text-green-400 font-bold">{formatCLP(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 bg-gray-800/30 flex justify-end">
              <button onClick={() => setShowModal(false)} className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-bold transition">
                Cerrar Auditoría
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}