import { useState, useEffect } from "react";
import api from "../services/api";
import PurchaseForm from "../components/PurchaseForm";
import PurchaseTable from "../components/PurchaseTable";

export default function AdminVentas() {
  const [compras, setCompras] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const fetchData = async () => {
    try {
      const [cRes, aRes] = await Promise.all([
        api.get("/admin/compras"),
        api.get("/admin/compras/alertas-vencimiento").catch(() => ({ data: [] }))
      ]);
      setCompras(cRes.data);
      setAlertas(aRes.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      {/* Banner de Alerta */}
      {alertas.length > 0 && (
        <div className="mb-8 p-6 bg-gray-800 border-l-8 border-amber-500 rounded-lg shadow-xl flex items-center justify-between">
           <div>
             <h2 className="text-lg font-bold text-amber-500">⚠️ Facturas por vencer</h2>
             <p className="text-gray-300">Tienes {alertas.length} factura(s) que vencen en los próximos 5 días.</p>
           </div>
           <div className="flex gap-2">
             {alertas.map((a, i) => (
               <div key={i} className="bg-gray-700 px-3 py-1 rounded text-xs border border-gray-600">
                 {a.proveedor} | {a.due_date}
               </div>
             ))}
           </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Administración de Compras</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 px-6 py-2 rounded-lg font-bold">
          {showForm ? "✕ Cerrar" : "+ Nueva Compra"}
        </button>
      </div>

      {showForm && <PurchaseForm onSave={() => { fetchData(); setShowForm(false); }} onCancel={() => setShowForm(false)} />}
      
      <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
        <PurchaseTable data={compras} />
      </div>
    </div>
  );
}