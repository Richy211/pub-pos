import { useEffect, useState } from "react";
import { getProducts, deleteProduct } from "../services/products";
import { Link } from "react-router-dom";

function Products() {
  const [products, setProducts] = useState([]);

  const loadProducts = async () => {
    try {
      const res = await getProducts();
      console.log("DATA 👉", res.data);
      setProducts(res.data);
    } catch (error) {
      console.error("Error cargando productos", error);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = confirm("¿Eliminar producto?");
    if (!confirmDelete) return;

    try {
      await deleteProduct(id);
      loadProducts();
    } catch (error) {
      console.error("Error eliminando producto", error);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Productos</h1>

        <Link to="/products/new">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            + Crear Producto
          </button>
        </Link>
      </div>

      {/* Tabla */}
      <div className="bg-white shadow-md rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-600 uppercase text-sm">
            <tr>
              <th className="px-6 py-3">Nombre</th>
              <th className="px-6 py-3">Precio</th>
              <th className="px-6 py-3">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {products.length > 0 ? (
              products.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">

                <td className="px-6 py-4 font-semibold text-gray-900">{p.name}</td>
                <td className="px-6 py-4 text-gray-600">${Number(p.price).toLocaleString()}</td>

                  <td className="px-6 py-4 flex gap-2">
                    <button className="bg-yellow-400 px-3 py-1 rounded hover:bg-yellow-500">
                      Editar
                    </button>

                    <button
                      onClick={() => handleDelete(p.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-6 py-4 text-center" colSpan="3">
                  No hay productos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Products;