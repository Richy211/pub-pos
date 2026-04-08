import { useState, useEffect } from "react";

function ProductForm({ onSubmit, initialData }) {
  const [form, setForm] = useState({
    name: "",
    price: "",
  });

  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 CARGAR DATOS SI ES EDICIÓN
  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        price: initialData.price || "",
      });
      setCategory(initialData.category || "");
    }
  }, [initialData]);

  // 🔹 MANEJO INPUTS
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // 🔹 SUBMIT (ARREGLADO)
  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit({
      name: form.name,
      price: form.price,
      category: category,
    });
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md">
      
      <h2 className="text-xl font-bold mb-4">
        {initialData ? "Editar Producto" : "Nuevo Producto"}
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        {/* NOMBRE */}
        <input
          type="text"
          name="name"
          placeholder="Nombre del producto"
          value={form.name}
          onChange={handleChange}
          className="border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* PRECIO */}
        <input
          type="number"
          name="price"
          placeholder="Precio"
          value={form.price}
          onChange={handleChange}
          className="border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* CATEGORÍA */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Seleccionar categoría</option>
          <option value="Cervezas">Cervezas</option>
          <option value="Tragos">Tragos</option>
          <option value="Bebidas">Bebidas</option>
          <option value="Comida">Comida</option>
        </select>

        {/* BOTÓN */}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
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