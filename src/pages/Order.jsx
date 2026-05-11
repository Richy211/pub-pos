import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../services/api";

export default function Order() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [seats, setSeats] = useState([1]); 
  const [activeSeat, setActiveSeat] = useState(1); 

  // 1. AGRUPACIÓN Y ORDENAMIENTO POR CATEGORÍA
  const groupedProducts = products.reduce((acc, product) => {
    const categoryName = product.category ? product.category.trim() : "Otros";
    if (!acc[categoryName]) acc[categoryName] = [];
    acc[categoryName].push(product);
    return acc;
  }, {});

  const sortedCategories = Object.keys(groupedProducts).sort();

  // 2. EFECTOS
  useEffect(() => {
    loadOrder();
    loadProducts();
  }, [id]);

  useEffect(() => {
    if (order?.id) loadItems(order.id);
  }, [order]);

  // 3. FUNCIONES DE CARGA (Rutas corregidas para tu Backend)
  const loadOrder = () => {
    api.get(`/orders/table/${id}`)
      .then(res => setOrder(res.data))
      .catch(err => {
        console.error("Error cargando orden", err);
        setOrder(null);
      });
  }

  const loadProducts = () => {
    api.get("/products")
      .then(res => setProducts(res.data))
      .catch(err => console.error("Error cargando productos", err));
  }

  const loadItems = (orderId) => {
    api.get(`/order-items/${orderId}`)
      .then(res => setItems(res.data || []))
      .catch(err => console.error("Error items", err));
  }

  // 4. ACCIONES
  const openOrder = () => {
    api.post("/open-order", { table_id: id })
      .then(() => loadOrder())
      .catch(err => alert("Error al abrir mesa"));
  }

  const addProduct = (productId) => {
    if (!order?.id) return;
    api.post("/order-items", {
      order_id: order.id,
      product_id: productId,
      seat_id: activeSeat
    })
    .then(() => loadItems(order.id))
    .catch((err) => console.error("Error al agregar:", err));
  };

  const removeItem = (itemId) => {
    if (!window.confirm("¿Quitar este producto?")) return;
    // Ajusta esta ruta si tu backend usa DELETE /api/order-items/:id
    api.delete(`/order_items?id=eq.${itemId}`) 
      .then(() => loadItems(order.id))
      .catch(err => alert("No se pudo eliminar"));
  };

  const addSeat = () => {
    const nextSeat = seats.length + 1;
    setSeats([...seats, nextSeat]);
    setActiveSeat(nextSeat);
  };

  const goToPayment = () => navigate(`/payment/${order.id}`);
  
  const total = items.reduce((acc, item) => {
    return acc + (Number(item.quantity || 1) * Number(item.price || 0));
  }, 0);

  // RENDERIZADO DE CARGA / MESA CERRADA
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <h2 className="text-2xl mb-6 font-bold uppercase tracking-tighter">Mesa {id}</h2>
        <button onClick={openOrder} className="bg-green-600 hover:bg-green-500 px-10 py-5 rounded-2xl font-black text-xl shadow-2xl transition-all active:scale-95">
          ABRIR MESA
        </button>
      </div>
    );
  }

  // RENDERIZADO PRINCIPAL
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans">
      <div className="bg-gray-950 p-4 flex justify-between items-center border-b border-gray-800">
        <h1 className="text-xl font-black text-green-400">🍺 Pub POS - Mesa {id}</h1>
        <div className="flex gap-2 items-center">
          {seats.map(s => (
            <button 
              key={`seat-btn-${s}`} 
              onClick={() => setActiveSeat(s)}
              className={`px-4 py-2 rounded-xl font-black transition-all ${activeSeat === s ? 'bg-green-500 text-black scale-110 shadow-lg' : 'bg-gray-800 text-gray-400'}`}
            >
              #{s}
            </button>
          ))}
          <button onClick={addSeat} className="bg-gray-700 w-10 h-10 rounded-full font-bold">+</button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-2/3 p-6 overflow-y-auto">
          {sortedCategories.map(category => (
            <div key={`section-${category}`} className="mb-10">
              <h2 className="text-sm font-black mb-4 text-green-500 uppercase tracking-[0.2em] border-b border-gray-800 pb-2">
                {category}
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedProducts[category].map(p => (
                  <div 
                    key={`p-${p.id}`} 
                    onClick={() => p.stock > 0 && addProduct(p.id)} 
                    className={`relative p-4 rounded-2xl border-2 transition-all active:scale-95 ${p.stock <= 0 ? 'bg-gray-800 opacity-40 cursor-not-allowed' : 'bg-gray-800 border-transparent hover:border-green-500 cursor-pointer shadow-lg'}`}
                  >
                    <div className="font-bold text-xs mb-1 text-gray-400 uppercase tracking-tight">{p.name}</div>
                    <div className="text-green-400 font-black text-xl">${p.price.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="w-1/3 bg-gray-950 p-6 border-l border-gray-800 flex flex-col">
          <h2 className="text-xl font-black mb-6 flex items-center gap-2">🧾 DETALLE</h2>
          <div className="flex-1 overflow-y-auto space-y-4">
            {/* Aquí iría el mapeo de los items por persona... */}
          </div>
          <div className="mt-6 pt-6 border-t border-gray-800">
            <div className="flex justify-between text-3xl font-black mb-6">
              <span className="text-green-400">${total.toLocaleString()}</span>
            </div>
            <button onClick={goToPayment} className="w-full py-5 rounded-2xl bg-green-600 font-black text-lg uppercase">
              Ir a Pagar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}