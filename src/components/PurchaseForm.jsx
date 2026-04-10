import { useState, useEffect } from "react";
import api from "../services/api";

export default function PurchaseForm({ onSave, onCancel }) {
  const [proveedores, setProveedores] = useState([]);
  const [formData, setFormData] = useState({
    proveedor_id: "", // Corregido según tu DB
    date: new Date().toISOString().slice(0, 16),
    total_neto: 0,    // Corregido según tu DB
    iva: 0,
    total: 0,
    status: "completado" // Usamos 'completado' que es el estándar de tu sistema
  });

  useEffect(() => {
    // Cargar proveedores (Asegúrate de que la ruta sea esta)
    api.get("/admin/proveedores")
      .then(res => setProveedores(res.data))
      .catch(err => console.error("Error cargando proveedores:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };

    // Cálculo automático de IVA
    if (name === "total_neto") {
      const neto = parseFloat(value) || 0;
      newFormData.iva = Math.round(neto * 0.19);
      newFormData.total = neto + newFormData.iva;
    }

    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Enviamos a la ruta que ya tienes en server.js
      await api.post("/admin/compras", formData);
      alert("Compra registrada con éxito");
      onSave(); // Refresca la tabla
    } catch (err) {
      console.error("Error al guardar compra:", err);
      alert("Error al guardar la compra. Revisa la consola.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
      <h3 className="text-xl font-bold mb-4 text-green-400">Nueva Factura de Compra</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Proveedor */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Proveedor</label>
          <select 
            name="proveedor_id" 
            value={formData.proveedor_id} 
            onChange={handleChange}
            className="w-full bg-gray-700 p-2 rounded border border-gray-600 focus:outline-none focus:border-green-500 text-white"
            required
          >
            <option value="">Selecciona un proveedor</option>
            {proveedores.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>

        {/* Fecha */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Fecha de Compra</label>
          <input 
            type="datetime-local" 
            name="date" 
            value={formData.date} 
            onChange={handleChange}
            className="w-full bg-gray-700 p-2 rounded border border-gray-600 text-white"
          />
        </div>

        {/* Monto Neto */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Monto Neto</label>
          <input 
            type="number" 
            name="total_neto" 
            value={formData.total_neto} 
            onChange={handleChange}
            className="w-full bg-gray-700 p-2 rounded border border-gray-600 text-white"
            placeholder="0"
          />
        </div>

        {/* Total con IVA */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Total (con IVA)</label>
          <input 
            type="number" 
            name="total" 
            value={formData.total} 
            readOnly 
            className="w-full bg-gray-600 p-2 rounded border border-gray-600 cursor-not-allowed text-gray-300"
          />
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <button type="submit" className="bg-green-600 px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition text-white">
          Guardar Compra
        </button>
        <button type="button" onClick={onCancel} className="bg-gray-600 px-6 py-2 rounded-lg font-bold hover:bg-gray-700 text-white">
          Cancelar
        </button>
      </div>
    </form>
  );
}