import { useState } from "react";

function ProductForm({ onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    price: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.price) {
      alert("Todos los campos son obligatorios");
      return;
    }

    try {
      setLoading(true);
      await onSubmit(form);
    } catch (error) {
      console.error("Error en formulario", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Nuevo Producto</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
          <input
            type="text"
            name="name"
            placeholder="Nombre del producto"
            value={form.name}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

       <input
            type="number"
            name="price"
            placeholder="Precio"
            value={form.price}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Guardando..." : "Guardar Producto"}
        </button>
      </form>
    </div>
  );
}

export default ProductForm;