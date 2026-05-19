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

  // 2. CARGA DE DATOS
  useEffect(() => {
    loadOrder();
    loadProducts();
  }, [id]);

  useEffect(() => {
    if (order?.id) loadItems(order.id);
  }, [order]);

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

  // 3. ACCIONES DEL POS
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
  api.delete(`/order-items/${itemId}`)
    .then(() => loadItems(order.id))
    .catch(err => alert("No se pudo eliminar"));
};

const cancelOrder = () => {
  if (!order?.id) return;
  if (!window.confirm("¿Estás seguro de que deseas cancelar esta orden y volver?")) return;

  api.post(`/orders/${order.id}/cancel`)
    .then(() => navigate("/mesas"))
    .catch(err => {
      console.error("Error al cancelar la orden", err);
      alert("No se pudo cancelar la orden");
    });
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

  // PANTALLA INICIAL SI LA MESA ESTÁ CERRADA
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <h2 className="text-2xl mb-6 font-bold uppercase tracking-tighter text-green-500">Mesa {id}</h2>
        <div className="flex flex-col gap-4">
          <button onClick={openOrder} className="bg-green-600 hover:bg-green-500 px-10 py-5 rounded-2xl font-black text-xl shadow-2xl transition-all active:scale-95">
            ABRIR MESA
          </button>
          <button onClick={() => navigate("/mesas")} className="text-gray-400 hover:text-white font-bold text-sm tracking-wide uppercase transition-colors">
            Volver al Panel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans">
      {/* HEADER */}
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
          <button onClick={addSeat} className="bg-gray-700 w-10 h-10 rounded-full font-bold hover:bg-gray-600">+</button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* PANEL IZQUIERDO: PRODUCTOS */}
        <div className="w-2/3 p-6 overflow-y-auto bg-gray-900">
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
                    <span className="absolute top-2 right-2 text-[8px] font-bold text-gray-500">STK: {p.stock}</span>
                    <div className="font-bold text-xs mb-1 text-gray-300 uppercase tracking-tight">{p.name}</div>
                    <div className="text-green-400 font-black text-xl">${Number(p.price).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* PANEL DERECHO: DETALLE DINÁMICO */}
        <div className="w-1/3 bg-gray-950 p-6 border-l border-gray-800 flex flex-col shadow-2xl">
          <h2 className="text-xl font-black mb-6 flex items-center gap-2">
            <span>🧾</span> DETALLE POR PERSONA
          </h2>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {seats.map(seatNum => {
              const seatItems = items.filter(item => (item.seat_id || 1) === seatNum);
              const seatTotal = seatItems.reduce((acc, i) => acc + (Number(i.quantity || 1) * Number(i.price || 0)), 0);

              if (seatItems.length === 0 && seatNum !== activeSeat) return null;

              return (
                <div key={`seat-group-${seatNum}`} className={`p-4 rounded-2xl border transition-all ${activeSeat === seatNum ? 'border-green-500/50 bg-green-500/5' : 'border-gray-800 bg-gray-900/40'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-black text-[10px] text-green-400 tracking-widest uppercase">Persona #{seatNum}</span>
                    <span className="font-black text-sm text-white">${seatTotal.toLocaleString()}</span>
                  </div>
                  
                  <div className="space-y-2">
                    {seatItems.map(item => (
                      <div key={`item-row-${item.id}`} className="flex justify-between items-center text-[11px] bg-black/40 p-3 rounded-xl group border border-transparent hover:border-gray-700 transition-all">
                        <span className="font-bold uppercase flex items-center">
                          {item.quantity > 1 && <span className="text-green-500 font-black mr-2 bg-green-500/10 px-1.5 py-0.5 rounded-md text-[9px]">{item.quantity}x</span>}
                          <span className="text-gray-200">{item.name || 'Producto'}</span>
                        </span>
                        <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => removeItem(item.id)} className="text-red-500 hover:scale-125 transition-transform">❌</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* TOTAL Y ACCIONES INFERIORES */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <div className="flex justify-between text-3xl font-black mb-6">
              <span className="text-gray-500 text-xs self-center uppercase tracking-[0.3em]">Total</span>
              <span className="text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]">${total.toLocaleString()}</span>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={cancelOrder} 
                className="w-1/3 py-5 rounded-2xl bg-red-950/40 hover:bg-red-900/40 text-red-400 font-bold text-sm transition-all active:scale-[0.98] uppercase tracking-tighter border border-red-900/50"
              >
                Cancelar
              </button>
              
              <button 
                onClick={goToPayment} 
                disabled={items.length === 0} 
                className="w-2/3 py-5 rounded-2xl bg-green-600 hover:bg-green-500 font-black text-lg disabled:opacity-20 shadow-lg transition-all active:scale-[0.98] uppercase tracking-tighter"
              >
                Ir a Pagar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}