import { useState, useEffect } from "react";

function ProductForm({ onSubmit, initialData }) {
  // 1. Agregamos 'stock' al objeto inicial del form
  const [form, setForm] = useState({
    name: "",
    price: "",
    category_id: "",
    stock: "" // <-- Nuevo campo
  });

  const [loading, setLoading] = useState(false);

  // 🔥 CARGAR DATOS SI ES EDICIÓN
  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        price: initialData.price || "",
        category_id: initialData.category_id || "",
        stock: initialData.stock ?? 0, // <-- Cargamos el stock existente
      });
    }
  }, [initialData]);

  // 🔹 MANEJO INPUTS (Sigue funcionando para todo gracias al name)
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!form.category_id) {
      alert("Por favor, selecciona una categoría");
      return;
    }

    setLoading(true);
    
    // Enviamos el objeto form completo (incluyendo stock)
    onSubmit(form);
    
    if (!initialData) {
      setForm({ name: "", price: "", category_id: "", stock: "" });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md text-gray-900">
      
      <h2 className="text-xl font-bold mb-4">
        {initialData ? "Editar Producto" : "Nuevo Producto"}
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        {/* NOMBRE */}
        <input
          type="text"
          name="name"
          required
          placeholder="Nombre del producto"
          value={form.name}
          onChange={handleChange}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* PRECIO */}
        <input
          type="number"
          name="price"
          required
          placeholder="Precio"
          value={form.price}
          onChange={handleChange}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* STOCK (NUEVO CAMPO) */}
        <input
          type="number"
          name="stock"
          required
          placeholder="Cantidad / Stock inicial"
          value={form.stock}
          onChange={handleChange}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* CATEGORÍA */}
        <select
          name="category_id" 
          required
          value={form.category_id}
          onChange={handleChange}
          className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Seleccionar categoría</option>
          <option value="1">Cervezas</option>
          <option value="2">Tragos</option>
          <option value="3">Comida</option>
          <option value="4">Bebidas</option>
        </select>

        {/* BOTÓN */}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {loading
            ? "Guardando..."
            : initialData
            ? "Actualizar Producto"
            : "Guardar Producto"}
        </button>

      </form>
    </div>
  );
}

export default ProductForm;