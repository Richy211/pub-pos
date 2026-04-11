import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../services/api";

export default function Order() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);

  // Agrupación de productos (se mantiene igual)
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

  // --- MODIFICADO: Ahora recarga productos para actualizar stock visual ---
  const addProduct = (productId) => {
    if (!order?.id) return;
    api.post("/order-items", { order_id: order.id, product_id: productId })
      .then(() => {
        loadItems(order.id);
        loadProducts(); // <--- Recargamos productos para ver bajar el stock
      })
      .catch(err => {
        const msg = err.response?.data?.message || "Error al agregar";
        alert(msg); // Avisa si el backend rechaza por falta de stock
      });
  };

  // --- MODIFICADO: También recarga productos al quitar un item ---
  const removeItem = (itemId) => {
    api.delete(`/order-items/${itemId}`)
      .then(() => {
        loadItems(order.id);
        loadProducts(); // <--- Devuelve el stock visualmente
      });
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
        {/* PANEL IZQUIERDO: PRODUCTOS */}
        <div className="w-2/3 p-6 overflow-y-auto">
          {Object.keys(groupedProducts).map(cat => (
            <div key={cat} className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-green-400 border-b border-gray-800 pb-2 capitalize">{cat}</h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedProducts[cat].map(p => {
                  // LÓGICA DE STOCK VISUAL
                  const isOutOfStock = p.stock <= 0;
                  const isLowStock = p.stock > 0 && p.stock <= 5;

                  return (
                    <div 
                      key={p.id} 
                      onClick={() => !isOutOfStock && addProduct(p.id)} 
                      className={`relative p-4 rounded-xl transition-all active:scale-95 shadow-lg border-2 ${
                        isOutOfStock 
                          ? 'bg-gray-800 border-red-900 opacity-50 grayscale cursor-not-allowed' 
                          : isLowStock 
                            ? 'bg-gray-800 border-orange-500 hover:bg-gray-700 cursor-pointer' 
                            : 'bg-gray-800 border-transparent hover:border-green-500 hover:bg-gray-700 cursor-pointer'
                      }`}
                    >
                      {/* BADGE DE STOCK */}
                      <div className={`absolute -top-2 -right-2 px-2 py-0.5 rounded text-[10px] font-black shadow-md border ${
                        isOutOfStock 
                          ? 'bg-red-600 border-red-400 text-white' 
                          : isLowStock 
                            ? 'bg-orange-500 border-orange-300 text-white animate-pulse' 
                            : 'bg-green-600 border-green-400 text-white'
                      }`}>
                        {isOutOfStock ? 'AGOTADO' : `STK: ${p.stock}`}
                      </div>

                      <div className="font-bold uppercase text-sm mb-1">{p.name}</div>
                      <div className="text-green-400 font-black text-lg">${p.price}</div>
                      
                      {isLowStock && (
                        <div className="text-[9px] text-orange-400 font-bold mt-1 uppercase animate-pulse">
                          ¡Últimas unidades!
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* PANEL DERECHO: DETALLE (Se mantiene igual) */}
        <div className="w-1/3 bg-gray-950 p-6 border-l border-gray-800 flex flex-col">
          <h2 className="text-xl font-bold mb-4">🧾 Detalle</h2>
          <div className="flex-1 overflow-y-auto space-y-2">
            {items.map(item => (
              <div key={item.id} className="flex justify-between bg-gray-900 p-3 rounded-lg border border-gray-800">
                <span>{item.name} <span className="text-green-400">x{item.quantity}</span></span>
                <div className="flex gap-2 items-center">
                  <span className="font-bold">${(item.quantity * item.price).toLocaleString()}</span>
                  <button onClick={() => removeItem(item.id)} className="text-red-500 hover:scale-110 transition-transform">❌</button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-800">
            <div className="flex justify-between text-2xl font-bold mb-4">
              <span>Total</span> <span className="text-green-400">${total.toLocaleString()}</span>
            </div>
            <button 
              disabled={items.length === 0}
              onClick={goToPayment} 
              className={`w-full p-4 rounded-xl font-bold text-lg transition-colors ${
                items.length === 0 ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              Ir a pagar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}