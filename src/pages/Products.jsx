import { useEffect, useState } from "react";
import ProductForm from "../components/ProductForm";
import { deleteProduct, getProducts, createProduct, updateProduct } from "../services/products";

function Products() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (error) {
      console.error("Error cargando productos", error);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  const handleCreate = async (data) => {
    await createProduct(data);
    loadProducts();
  };

  const handleUpdate = async (data) => {
    await updateProduct(editingProduct.id, data);
    setEditingProduct(null);
    loadProducts();
  };

  const handleDelete = async (id) => {
    if (confirm("¿Eliminar producto?")) {
      await deleteProduct(id);
      loadProducts();
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const currentItems = products.slice(indexOfLastItem - itemsPerPage, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  return (
    <div className="p-6 text-white bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-green-400">Gestión de Productos</h1>
      <div className="bg-gray-800 p-6 rounded-xl mb-8">
        <ProductForm onSubmit={editingProduct ? handleUpdate : handleCreate} initialData={editingProduct} />
      </div>
      <div className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-gray-700 text-green-400">
            <tr>
              <th className="px-6 py-4">Nombre</th>
              <th className="px-6 py-4">Precio</th>
              <th className="px-6 py-4">Categoría</th>
              <th className="px-6 py-4">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {currentItems.map((p) => (
              <tr key={p.id} className="hover:bg-gray-750 transition-colors">
                <td className="px-6 py-4">{p.name}</td>
                <td className="px-6 py-4 font-bold text-green-400">${p.price}</td>
                <td className="px-6 py-4">{p.category || "General"}</td>
                <td className="px-6 py-4 space-x-3">
                  <button onClick={() => setEditingProduct(p)} className="text-yellow-500 hover:text-yellow-400">Editar</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-400">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 flex justify-center gap-2 bg-gray-900">
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} onClick={() => setCurrentPage(i + 1)} className={`px-4 py-2 rounded ${currentPage === i+1 ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'}`}>{i + 1}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
export default Products;