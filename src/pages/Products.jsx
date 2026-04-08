import { useEffect, useState } from "react";
import ProductForm from "../components/ProductForm";
import {
  deleteProduct,
  getProducts,
  createProduct,
  updateProduct,
} from "../services/products";

function Products() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);

  // 🔹 Cargar productos
  const loadProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (error) {
      console.error("Error cargando productos", error);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // 🔹 Crear
  const handleCreate = async (data) => {
    try {
      await createProduct(data);
      loadProducts();
    } catch (error) {
      console.error("Error creando producto", error);
    }
  };

  // 🔹 Editar
  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  // 🔹 Actualizar
  const handleUpdate = async (data) => {
    try {
      await updateProduct(editingProduct.id, data);
      setEditingProduct(null);
      loadProducts();
    } catch (error) {
      console.error("Error actualizando", error);
    }
  };

  // 🔹 Eliminar
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
    <div className="p-6 text-black">
      <h1 className="text-2xl font-bold mb-4">Productos</h1>

      {/* 🔥 FORMULARIO */}
      <ProductForm
        onSubmit={editingProduct ? handleUpdate : handleCreate}
        initialData={editingProduct}
      />

      {/* 🔥 TABLA */}
      <div className="bg-white shadow-md rounded-xl overflow-hidden mt-4">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-600 uppercase text-sm">
            <tr>
              <th className="px-6 py-3">Nombre</th>
              <th className="px-6 py-3">Precio</th>
              <th className="px-6 py-3">Categoría</th>
              <th className="px-6 py-3">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t">
                <td className="px-6 py-3">{product.name}</td>
                <td className="px-6 py-3">${product.price}</td>
                <td className="px-6 py-3">
                  {product.category || "Sin categoría"}
                </td>

                <td className="px-6 py-3 space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => handleDelete(product.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Products;