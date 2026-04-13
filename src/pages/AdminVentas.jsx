import { useState, useEffect } from "react";
import api from "../services/api";
import PurchaseForm from "../components/PurchaseForm";
import PurchaseTable from "../components/PurchaseTable";

export default function AdminVentas() {
  const [compras, setCompras] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // 1. Función para cargar las compras
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

  // 2. Función para eliminar (DENTRO de AdminVentas)
  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este registro? Esta acción no se puede deshacer.")) {
      try {
        await api.delete(`/admin/compras/${id}`);
        fetchCompras(); // Recarga la lista automáticamente
        alert("Registro eliminado con éxito");
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert("No se pudo eliminar el registro");
      }
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      {/* CABECERA */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Administración de Compras</h1>
          <p className="text-gray-400 text-sm">Gestiona tus costos y facturas de proveedores</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-lg active:scale-95"
        >
          {showForm ? "✕ Cerrar" : "+ Nueva Compra"}
        </button>
      </div>

      {/* FORMULARIO (Se muestra al hacer clic en el botón azul) */}
      {showForm && (
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <PurchaseForm 
            onSave={() => {
              fetchCompras();
              setShowForm(false);
            }} 
            onCancel={() => setShowForm(false)} 
          />
        </div>
      )}

      {/* TABLA DE HISTORIAL */}
      <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
        <div className="p-4 border-b border-gray-700 bg-gray-800/50 flex justify-between items-center">
          <h3 className="font-bold text-gray-300 uppercase text-xs tracking-widest">Historial de Adquisiciones</h3>
          <span className="text-[10px] bg-gray-700 px-2 py-1 rounded text-gray-400">
            {compras.length} Registros
          </span>
        </div>
        
        {/* AQUÍ PASAMOS LOS DATOS Y LA FUNCIÓN DE BORRADO */}
        <PurchaseTable data={compras} onDelete={handleDelete} />
        
      </div>
    </div>
  );
}