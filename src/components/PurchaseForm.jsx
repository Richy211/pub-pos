import { useState, useEffect } from "react";
import api from "../services/api";

export default function PurchaseForm({ onSave, onCancel }) {
  const [proveedores, setProveedores] = useState([]);
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [items, setItems] = useState([]); // Lista de productos comprados
  const [formData, setFormData] = useState({
    proveedor_id: "",
    date: new Date().toISOString().slice(0, 16),
    total_neto: 0,
    iva: 0,
    total: 0
  });

  useEffect(() => {
    // Cargar proveedores y productos
    Promise.all([
      api.get("/admin/proveedores"),
      api.get("/products")
    ]).then(([provRes, prodRes]) => {
      setProveedores(provRes.data);
      setProductosDisponibles(prodRes.data);
    }).catch(err => console.error("Error cargando datos:", err));
  }, []);

  // Agregar un producto a la lista de compra
  const addItem = () => {
    setItems([...items, { product_id: "", quantity: 1, price_unit: 0 }]);
  };

const updateItem = (index, field, value) => {
  const newItems = [...items];
  newItems[index][field] = value;
  setItems(newItems);

  // 🔥 CALCULO CLAVE: Esto actualiza el Neto y el IVA antes de enviar
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


  const calculateTotals = (currentItems) => {
    const neto = currentItems.reduce((acc, item) => acc + (item.quantity * item.price_unit), 0);
    const iva = Math.round(neto * 0.19);
    setFormData(prev => ({
      ...prev,
      total_neto: neto,
      iva: iva,
      total: neto + iva
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return alert("Agrega al menos un producto");

    try {
      // USAMOS LA RUTA CORRECTA QUE SUBE STOCK
      await api.post("/admin/compras-completas", {
        ...formData,
        items: items // Enviamos el array que el backend espera
      });
      alert("Compra registrada y stock actualizado");
      onSave();
    } catch (err) {
      console.error("Error:", err);
      alert("Error al guardar");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-xl border border-gray-700">
      <h3 className="text-xl font-bold mb-4 text-green-400">Nueva Factura de Compra</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-gray-400">Proveedor</label>
          <select 
            name="proveedor_id" 
            onChange={(e) => setFormData({...formData, proveedor_id: e.target.value})}
            className="w-full bg-gray-700 p-2 rounded text-white" required
          >
            <option value="">Selecciona proveedor</option>
            {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400">Fecha</label>
          <input type="datetime-local" value={formData.date} readOnly className="w-full bg-gray-700 p-2 rounded text-gray-400" />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">Productos en Factura</label>
        {items.map((item, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <select 
              className="flex-1 bg-gray-700 p-2 rounded text-white"
              onChange={(e) => updateItem(index, "product_id", e.target.value)}
              required
            >
              <option value="">Producto</option>
              {productosDisponibles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input 
              type="number" placeholder="Cant" className="w-20 bg-gray-700 p-2 rounded text-white"
              onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value))}
            />
            <input 
              type="number" placeholder="Precio Unit" className="w-32 bg-gray-700 p-2 rounded text-white"
              onChange={(e) => updateItem(index, "price_unit", parseFloat(e.target.value))}
            />
          </div>
        ))}
        <button type="button" onClick={addItem} className="text-sm text-blue-400 hover:underline">+ Agregar producto</button>
      </div>

      <div className="border-t border-gray-700 pt-4 flex justify-between items-center text-white">
        <div>Neto: ${formData.total_neto.toLocaleString()}</div>
        <div>IVA (19%): ${formData.iva.toLocaleString()}</div>
        <div className="text-xl font-bold text-green-400">Total: ${formData.total.toLocaleString()}</div>
      </div>

      <div className="mt-6 flex gap-2">
        <button type="submit" className="bg-green-600 px-6 py-2 rounded-lg font-bold">Guardar y Subir Stock</button>
        <button type="button" onClick={onCancel} className="bg-gray-600 px-6 py-2 rounded-lg">Cancelar</button>
      </div>
    </form>
  );
}