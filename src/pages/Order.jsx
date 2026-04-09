import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../services/api";

export default function Order() {
  const { tableId } = useParams()
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [order, setOrder] = useState(null)
  const [items, setItems] = useState([])

  /* ===============================
      LÓGICA DE AGRUPAMIENTO (CORREGIDA)
  ============================== */
  const groupedProducts = products.reduce((acc, product) => {
    // Usamos la categoría que viene del JOIN en el backend
    const categoryName = product.category ? product.category.trim() : "Otros";
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(product);
    return acc;
  }, {});

  /* ===============================
      CARGA DE DATOS
  ============================== */
  useEffect(() => {
    loadOrder()
    loadProducts()
  }, [tableId])

  const loadOrder = () => {
    api.get(`/orders/table/${tableId}`)
      .then(res => {
        if (res.data) {
          setOrder(res.data)
        } else {
          setOrder(null)
          setItems([])
        }
      })
  }

  const loadProducts = () => {
    api.get("/products")
      .then(res => setProducts(res.data))
      .catch(err => console.error("Error cargando productos:", err))
  }

  useEffect(() => {
    if (order) {
      loadItems(order.id)
    }
  }, [order])

  const loadItems = (orderId) => {
    api.get(`/order-items/${orderId}`)
      .then(res => setItems(res.data))
  }

  /* ===============================
      ACCIONES
  ============================== */
  const openOrder = () => {
    api.post("/open-order", { table_id: tableId })
      .then(res => setOrder(res.data))
  }

/*   const addProduct = (productId) => {
    if (!order) return;
    api.post("/order-items", {
      order_id: order.id,
      product_id: productId
    })
      .then(() => loadItems(order.id))
      .catch(err => alert("Sin stock o error al agregar"));
  }
 */
const addProduct = (productId) => {
  if (!order || !order.id) {
    alert("Error: No hay una orden abierta para esta mesa");
    return;
  }

  const datosAEnviar = {
    order_id: Number(order.id), // Forzamos que sea número
    product_id: Number(productId) // Forzamos que sea número
  };

  console.log("Enviando a la API:", datosAEnviar);

  api.post("/order-items", datosAEnviar)
    .then(() => loadItems(order.id))
    .catch(err => {
      // ESTO ES CLAVE: Mira qué dice el error 400
      console.error("Detalle del error 400:", err.response?.data);
      alert("Error 400: El servidor dice que los datos están mal.");
    });
};



  const removeItem = (id) => {
    // Usamos DELETE según la ruta de tu server.js
    api.delete(`/order-items/${id}`)
      .then(() => loadItems(order.id))
      .catch(err => console.error("Error al eliminar item:", err));
  };

  const cancelOrder = () => {
    if (!window.confirm("¿Seguro que quieres cancelar toda la mesa?")) return;
    api.post("/cancel-order", { order_id: order.id })
      .then(() => navigate("/", { replace: true }))
  };

  const goToPayment = () => {
    navigate(`/payment/${order.id}`)
  }

  const total = items.reduce((acc, item) => acc + (item.quantity * item.price), 0)

  /* ===============================
      RENDERIZADO
  ============================== */
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <h2 className="text-2xl mb-6">Mesa {tableId}</h2>
        <button
          onClick={openOrder}
          className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-xl text-lg font-bold"
        >
          Abrir mesa
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* HEADER */}
      <div className="bg-gray-950 border-b border-gray-800 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-green-400">🍺 Pub POS</h1>
        <div className="text-sm text-gray-400">Mesa {tableId}</div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* PANEL IZQUIERDO: PRODUCTOS */}
        <div className="w-2/3 p-6 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-4">🍻 Carta</h1>
          <div className="space-y-8">
            {Object.keys(groupedProducts).map(category => (
              <div key={category}>
                <h2 className="text-xl font-bold mb-3 text-green-400 border-b border-gray-800 pb-1">
                  {category}
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedProducts[category].map(product => (
                    <div
                      key={product.id}
                      onClick={() => addProduct(product.id)}
                      className="bg-gray-800 hover:bg-green-700 active:scale-95 transition-all p-4 rounded-xl cursor-pointer shadow-lg"
                    >
                      <div className="font-bold">{product.name}</div>
                      <div className="text-green-400">${product.price.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PANEL DERECHO: DETALLE PEDIDO */}
        <div className="w-1/3 bg-gray-950 p-6 border-l border-gray-800 flex flex-col">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-800 pb-2">
            🧾 Pedido ({items.length})
          </h2>

          <div className="flex-1 overflow-y-auto space-y-3">
            {items.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-gray-900 p-3 rounded-lg">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-gray-500">x{item.quantity}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm">${(item.quantity * item.price).toLocaleString()}</span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white p-1 rounded transition-colors"
                  >
                    ❌
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3 pt-4 border-t border-gray-800">
            <div className="flex justify-between text-2xl font-bold">
              <span>Total</span>
              <span className="text-green-400">${total.toLocaleString()}</span>
            </div>

            <button
              onClick={goToPayment}
              className="w-full bg-green-600 hover:bg-green-500 p-4 rounded-xl font-bold text-lg shadow-lg transition-colors"
            >
              💳 Ir a pagar
            </button>

            <button
              onClick={cancelOrder}
              className="w-full bg-transparent hover:bg-red-500/10 text-red-500 p-3 rounded-xl font-medium text-sm transition-colors"
            >
              Cancelar mesa
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}