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

  const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage] = useState(10); // Número de productos por página

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

// Índices para el rebanado
const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;

// Estos son los productos que vas a mapear en la tabla
const currentItems = products.slice(indexOfFirstItem, indexOfLastItem);

// Total de páginas
const totalPages = Math.ceil(products.length / itemsPerPage);

// Función para cambiar de página
const paginate = (pageNumber) => setCurrentPage(pageNumber);


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
            {currentItems.map((product) => (
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

        <div className="flex justify-between items-center mt-6 bg-gray-100 p-4 rounded-xl border border-gray-200 shadow-inner">
  {/* Texto con mejor contraste (gris oscuro casi negro) */}
  <div className="text-sm font-medium text-gray-700">
    Mostrando <span className="text-blue-600">{indexOfFirstItem + 1}</span> a <span className="text-blue-600">{Math.min(indexOfLastItem, products.length)}</span> de {products.length} productos
  </div>
  
  <div className="flex gap-2">
    {/* Botón Anterior */}
    <button
      onClick={() => paginate(currentPage - 1)}
      disabled={currentPage === 1}
      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
    >
      Anterior
    </button>

    {/* Números de página */}
    {[...Array(totalPages)].map((_, i) => (
      <button
        key={i + 1}
        onClick={() => paginate(i + 1)}
        className={`px-4 py-2 rounded-lg font-bold transition-all shadow-sm ${
          currentPage === i + 1 
            ? 'bg-blue-600 text-white border border-blue-600' 
            : 'bg-white border border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-500'
        }`}
      >
        {i + 1}
      </button>
    ))}

    {/* Botón Siguiente */}
    <button
      onClick={() => paginate(currentPage + 1)}
      disabled={currentPage === totalPages}
      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
    >
      Siguiente
    </button>
  </div>
</div>
      </div>
    </div>
  );
}

export default Products;