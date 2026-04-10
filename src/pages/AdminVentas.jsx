import { useState, useEffect } from "react";
import api from "../services/api";
import PurchaseForm from "../components/PurchaseForm";
import PurchaseTable from "../components/PurchaseTable";

export default function AdminVentas() {
  const [compras, setCompras] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const fetchCompras = async () => {
    try {
      const res = await api.get("/admin/compras");
      setCompras(res.data);
    } catch (err) {
      console.error("Error al cargar compras:", err);
    }
  };

  useEffect(() => {
    fetchCompras();
  }, []);

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Administración de Compras</h1>
          <p className="text-gray-400">Gestiona tus costos y facturas de proveedores</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition"
        >
          {showForm ? "✕ Cerrar" : "+ Nueva Compra"}
        </button>
      </div>

      {showForm && (
        <div className="mb-8">
          <PurchaseForm 
            onSave={() => {
              fetchCompras();
              setShowForm(false);
            }} 
            onCancel={() => setShowForm(false)} 
          />
        </div>
      )}

      <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700">
        <div className="p-4 border-b border-gray-700 bg-gray-800/50">
          <h3 className="font-bold text-gray-300">Historial de Adquisiciones</h3>
        </div>
        <PurchaseTable data={compras} />
      </div>
    </div>
  );
}