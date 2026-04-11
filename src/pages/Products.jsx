import { useEffect, useState } from "react";
import ProductForm from "../components/ProductForm";
import { deleteProduct, getProducts, createProduct, updateProduct } from "../services/products";

function Products() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para el Modal
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
    setIsModalOpen(false); // Cerramos modal tras editar
    loadProducts();
  };

  const handleDelete = async (id) => {
    if (confirm("¿Eliminar producto?")) {
      await deleteProduct(id);
      loadProducts();
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingProduct(null);
    setIsModalOpen(false);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const currentItems = products.slice(indexOfLastItem - itemsPerPage, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  return (
    <div className="p-6 text-white bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-green-400">Gestión de Productos</h1>
      
      {/* FORMULARIO DE CREACIÓN (Siempre visible arriba) */}
      <div className="bg-gray-800 p-6 rounded-xl mb-8 border border-gray-700 shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-gray-300">Añadir Nuevo Producto</h2>
        <ProductForm onSubmit={handleCreate} />
      </div>

      {/* TABLA DE PRODUCTOS */}
      <div className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl border border-gray-700">
        <table className="w-full text-left">
          <thead className="bg-gray-700 text-green-400">
            <tr>
              <th className="px-6 py-4">Nombre</th>
              <th className="px-6 py-4">Precio</th>
              <th className="px-6 py-4">Categoría</th>
              <th className="px-6 py-4 text-center">Stock</th>
              <th className="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {currentItems.map((p) => (
              <tr key={p.id} className="hover:bg-gray-750 transition-colors">
                <td className="px-6 py-4">{p.name}</td>
                <td className="px-6 py-4 font-bold text-green-400">${p.price}</td>
                <td className="px-6 py-4">{p.category || "General"}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.stock <= 5 ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'}`}>
                    {p.stock ?? 0}
                  </span>
                </td>
                <td className="px-6 py-4 text-center space-x-3">
                  <button onClick={() => openEditModal(p)} className="text-yellow-500 hover:text-yellow-400 font-medium">Editar</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-400 font-medium">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PAGINACIÓN */}
        <div className="p-4 flex justify-center gap-2 bg-gray-800 border-t border-gray-700">
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} onClick={() => setCurrentPage(i + 1)} className={`px-4 py-2 rounded transition-all ${currentPage === i+1 ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>{i + 1}</button>
          ))}
        </div>
      </div>

      {/* --- MODAL DE EDICIÓN --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 backdrop-blur-sm p-4">
          <div className="bg-gray-800 border border-gray-700 p-2 rounded-2xl shadow-2xl max-w-md w-full relative">
            {/* Botón Cerrar X */}
            <button 
              onClick={closeEditModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl z-10"
            >
              &times;
            </button>
            
            {/* Reutilizamos el ProductForm pasándole initialData */}
            <div className="p-4">
              <ProductForm 
                onSubmit={handleUpdate} 
                initialData={editingProduct} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;