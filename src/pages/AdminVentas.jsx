import { useState, useEffect } from "react";
import api from "../services/api";
import PurchaseForm from "../components/PurchaseForm"; // Tu formulario existente
import PurchaseTable from "../components/PurchaseTable"; // Tu tabla existente

export default function AdminVentas() {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar las compras al iniciar
  const fetchCompras = async () => {
    try {
      const res = await api.get("/admin/compras");
      setCompras(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error al obtener compras:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompras();
  }, []);

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Administración de Compras y Costos</h1>
        <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-bold">
          + Nueva Compra
        </button>
      </div>

      {/* Resumen rápido de inversión */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-800 p-4 rounded-xl border-l-4 border-red-500">
          <p className="text-gray-400 text-sm">Inversión Total (Compras)</p>
          <h2 className="text-2xl font-bold">
            ${compras.reduce((acc, curr) => acc + Number(curr.total), 0).toLocaleString()}
          </h2>
        </div>
        <div className="bg-gray-800 p-4 rounded-xl border-l-4 border-blue-500">
          <p className="text-gray-400 text-sm">Facturas Recibidas</p>
          <h2 className="text-2xl font-bold">{compras.length}</h2>
        </div>
      </div>

      {/* Aquí insertamos tus componentes corregidos */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
        <PurchaseTable data={compras} refreshData={fetchCompras} />
      </div>
    </div>
  );
}