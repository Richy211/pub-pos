import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import api from "../services/api";

export default function PurchaseForm({ onSave, onCancel }) {
  const navigate = useNavigate();
  const [proveedores, setProveedores] = useState([]);
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    proveedor_id: "",
    date: new Date().toISOString().slice(0, 16),
    due_date: "", // Nuevo campo
    total_neto: 0,
    iva: 0,
    total: 0
  });

  useEffect(() => {
    Promise.all([
      api.get("/admin/proveedores"),
      api.get("/products")
    ]).then(([provRes, prodRes]) => {
      setProveedores(provRes.data);
      setProductosDisponibles(prodRes.data);
    }).catch(err => {
      console.error("Error cargando datos:", err);
      toast.error("Error al conectar con el servidor");
    });
  }, []);

  const addItem = () => {
    setItems([...items, { product_id: "", quantity: 1, price_unit: 0 }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    if (field === "product_id") {
      newItems[index][field] = parseInt(value);
    } else {
      newItems[index][field] = value;
    }
    setItems(newItems);

    const nuevoNeto = newItems.reduce((acc, item) => 
      acc + (parseInt(item.quantity || 0) * parseFloat(item.price_unit || 0)), 0
    );
    
    const nuevoIva = Math.round(nuevoNeto * 0.19);
    
    setFormData(prev => ({
      ...prev,
      total_neto: nuevoNeto,
      iva: nuevoIva,
      total: nuevoNeto + nuevoIva
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return toast.error("Agrega al menos un producto");
    if (!formData.proveedor_id) return toast.error("Selecciona un proveedor");
    if (!formData.due_date) return toast.error("Selecciona la fecha de vencimiento");

    const loadingToast = toast.loading("Registrando compra...");

    try {
      // Enviamos el formData completo (incluye due_date) y los items
      await api.post("/admin/compras-completas", { ...formData, items });
      
      toast.success("¡Compra registrada!", { id: loadingToast });
      onSave(); // Refresca la tabla en AdminVentas
    } catch (err) {
      console.error("Error:", err);
      toast.error("Error al procesar la compra", { id: loadingToast });
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in zoom-in duration-300">
      <Toaster position="top-right" />
      
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-2xl">
        <h3 className="text-2xl font-bold mb-6 text-green-400 flex items-center gap-2">
          <span className="bg-green-600 text-white p-1 rounded">🛒</span> Nueva Factura de Compra
        </h3>
        
        {/* FILA DE DATOS BÁSICOS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-400 mb-2">Proveedor</label>
            <select 
              name="proveedor_id" 
              onChange={(e) => setFormData({...formData, proveedor_id: e.target.value})}
              className="w-full bg-gray-700 p-2.5 rounded-lg text-white border border-gray-600 focus:ring-2 focus:ring-green-500 outline-none" 
              required
            >
              <option value="">Selecciona proveedor</option>
              {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Fecha Registro</label>
            <input type="datetime-local" value={formData.date} readOnly className="w-full bg-gray-900 p-2.5 rounded-lg text-gray-500 border border-gray-700 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Fecha Vencimiento</label>
            <input 
              type="date" 
              onChange={(e) => setFormData({...formData, due_date: e.target.value})}
              className="w-full bg-gray-700 p-2.5 rounded-lg text-white border border-gray-600 focus:ring-2 focus:ring-green-500 outline-none"
              required
            />
          </div>
        </div>

        {/* DETALLE DE PRODUCTOS */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-3">Detalle de Productos</label>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex flex-wrap md:flex-nowrap gap-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                <select 
                  className="flex-1 bg-gray-700 p-2 rounded text-white min-w-[200px]"
                  value={item.product_id}
                  onChange={(e) => updateItem(index, "product_id", e.target.value)}
                  required
                >
                  <option value="">Seleccionar Producto</option>
                  {productosDisponibles.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <input type="number" placeholder="Cant" min="1" value={item.quantity} className="w-20 bg-gray-700 p-2 rounded text-white text-center" onChange={(e) => updateItem(index, "quantity", e.target.value)} required />
                <input type="number" placeholder="Precio" value={item.price_unit} className="w-32 bg-gray-700 p-2 rounded text-white text-right" onChange={(e) => updateItem(index, "price_unit", e.target.value)} required />
              </div>
            ))}
          </div>
          <button type="button" onClick={addItem} className="mt-4 text-blue-400 hover:text-blue-300 transition-colors font-medium">+ Agregar línea</button>
        </div>

        {/* RESUMEN FINAL */}
        <div className="border-t border-gray-700 pt-6 flex justify-between items-center text-white">
          <div className="space-y-1">
            <p className="text-gray-400">Neto: <span className="font-mono text-xl">${formData.total_neto.toLocaleString('es-CL')}</span></p>
            <p className="text-gray-400">IVA (19%): <span className="font-mono text-xl">${formData.iva.toLocaleString('es-CL')}</span></p>
          </div>
          <div className="bg-gray-900 p-6 rounded-xl border-2 border-green-500/50 text-right">
            <p className="text-sm text-green-400 uppercase tracking-wider font-bold">Total Factura</p>
            <p className="text-4xl font-black text-green-400">${formData.total.toLocaleString('es-CL')}</p>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button type="submit" className="flex-1 bg-green-600 hover:bg-green-500 text-white py-4 rounded-xl font-bold text-lg transition-all">Confirmar Compra</button>
          <button type="button" onClick={onCancel} className="px-8 py-4 rounded-xl font-bold bg-gray-700 hover:bg-gray-600 text-white transition-all">Cancelar</button>
        </div>
      </form>
    </div>
  );
}