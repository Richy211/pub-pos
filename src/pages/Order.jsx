import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../services/api";

export default function Order() {
  const { id } = useParams(); // Coincide con path="/order/:id"
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);

  const groupedProducts = products.reduce((acc, product) => {
    const categoryName = product.category ? product.category.trim() : "Otros";
    if (!acc[categoryName]) acc[categoryName] = [];
    acc[categoryName].push(product);
    return acc;
  }, {});

  useEffect(() => {
    loadOrder();
    loadProducts();
  }, [id]);

  const loadOrder = () => {
    api.get(`/orders/table/${id}`)
      .then(res => setOrder(res.data || null))
      .catch(err => console.error("Error cargando orden", err));
  }

  const loadProducts = () => {
    api.get("/products")
      .then(res => setProducts(res.data))
      .catch(err => console.error("Error cargando productos", err));
  }

  useEffect(() => {
    if (order?.id) loadItems(order.id);
  }, [order]);

  const loadItems = (orderId) => {
    api.get(`/order-items/${orderId}`)
      .then(res => setItems(res.data))
      .catch(err => console.error("Error items", err));
  }

  const openOrder = () => {
    api.post("/open-order", { table_id: id })
      .then(res => setOrder(res.data))
      .catch(err => alert("Error al abrir mesa"));
  }

  const addProduct = (productId) => {
    if (!order?.id) return;
    api.post("/order-items", { order_id: order.id, product_id: productId })
      .then(() => loadItems(order.id))
      .catch(err => console.error("Error 400 detalle:", err.response?.data));
  };

  const removeItem = (itemId) => {
    api.delete(`/order-items/${itemId}`)
      .then(() => loadItems(order.id));
  };

  const goToPayment = () => navigate(`/payment/${order.id}`);

  const total = items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.price)), 0);

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <h2 className="text-2xl mb-6">Mesa {id}</h2>
        <button onClick={openOrder} className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-xl font-bold">Abrir mesa</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="bg-gray-950 p-4 flex justify-between items-center border-b border-gray-800">
        <h1 className="text-xl font-bold text-green-400">🍺 Pub POS - Mesa {id}</h1>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-2/3 p-6 overflow-y-auto">
          {Object.keys(groupedProducts).map(cat => (
            <div key={cat} className="mb-8">
              <h2 className="text-xl font-bold mb-3 text-green-400 border-b border-gray-800">{cat}</h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedProducts[cat].map(p => (
                  <div key={p.id} onClick={() => addProduct(p.id)} className="bg-gray-800 p-4 rounded-xl cursor-pointer hover:bg-green-700 active:scale-95 transition-all">
                    <div className="font-bold">{p.name}</div>
                    <div className="text-green-400">${p.price}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="w-1/3 bg-gray-950 p-6 border-l border-gray-800 flex flex-col">
          <h2 className="text-xl font-bold mb-4">🧾 Detalle</h2>
          <div className="flex-1 overflow-y-auto space-y-2">
            {items.map(item => (
              <div key={item.id} className="flex justify-between bg-gray-900 p-3 rounded-lg">
                <span>{item.name} x{item.quantity}</span>
                <div className="flex gap-2">
                  <span className="font-bold">${item.quantity * item.price}</span>
                  <button onClick={() => removeItem(item.id)} className="text-red-500">❌</button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-800">
            <div className="flex justify-between text-2xl font-bold mb-4">
              <span>Total</span> <span className="text-green-400">${total.toLocaleString()}</span>
            </div>
            <button onClick={goToPayment} className="w-full bg-green-600 p-4 rounded-xl font-bold text-lg">Ir a pagar</button>
          </div>
        </div>
      </div>
    </div>
  )
}