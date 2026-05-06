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
    api.get(`/open_order?table_id=eq.${id}`)
      .then(res => {
        if (res.data && res.data.length > 0) {
          setOrder(res.data[0]);
        } else {
          setOrder(null);
        }
      })
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

  useEffect(() => {
    if (order?.id) loadItems(order.id);
  }, [order]);

  const loadItems = (orderId) => {
    // Traemos los items con los datos del producto
    api.get(`/order_items?order_id=eq.${orderId}&select=*,products(*)`)
      .then(res => setItems(res.data || []))
      .catch(err => console.error("Error items", err));
  }

  const openOrder = () => {
    api.post("/open_order", { table_id: id, status: 'open' })
      .then(() => loadOrder())
      .catch(err => alert("Error al abrir mesa"));
  }

  const addProduct = (productId) => {
    if (!order?.id) return;
    api.post("/order_items", { 
        order_id: order.id, 
        product_id: productId,
        seat_id: activeSeat,
        quantity: 1 
      })
      .then(() => loadItems(order.id))
      .catch(err => alert("Error al agregar"));
  };

  // ANTICIPACIÓN: Borrado corregido para Supabase
  const removeItem = (itemId) => {
    if (!window.confirm("¿Quitar este producto?")) return;
    api.delete(`/order_items?id=eq.${itemId}`)
      .then(() => loadItems(order.id))
      .catch(err => console.error("Error al eliminar", err));
  };

  // ANTICIPACIÓN: Traslado corregido (usamos PATCH para actualizar solo seat_id)
  const transferItem = (itemId, currentSeat) => {
    const targetSeat = prompt("¿A qué persona quieres mover este producto?", currentSeat === 1 ? 2 : 1);
    if (targetSeat && !isNaN(targetSeat)) {
      api.patch(`/order_items?id=eq.${itemId}`, { seat_id: parseInt(targetSeat) })
        .then(() => loadItems(order.id))
        .catch(err => alert("Error al trasladar"));
    }
  };

  const cancelOrder = () => {
    if (window.confirm("¿Estás seguro de cancelar TODA la orden?")) {
      api.delete(`/open_order?id=eq.${order.id}`)
        .then(() => {
          alert("Orden cancelada");
          navigate("/");
        })
        .catch(err => console.error("Error al cancelar", err));
    }
  };

  const addSeat = () => {
    const nextSeat = seats.length + 1;
    setSeats([...seats, nextSeat]);
    setActiveSeat(nextSeat);
  };

  const goToPayment = () => navigate(`/payment/${order.id}`);
  
  const total = items.reduce((acc, item) => {
    const price = item.products?.price || 0;
    return acc + (Number(item.quantity || 1) * Number(price));
  }, 0);

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <h2 className="text-2xl mb-6 font-bold">Mesa {id}</h2>
        <button onClick={openOrder} className="bg-green-500 hover:bg-green-600 px-8 py-4 rounded-2xl font-black text-xl shadow-lg transition-transform active:scale-95">
          ABRIR MESA
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans">
      {/* Header con selectores de asiento */}
      <div className="bg-gray-950 p-4 flex justify-between items-center border-b border-gray-800 shadow-2xl">
        <h1 className="text-xl font-black text-green-400 tracking-tighter">🍺 Pub POS - Mesa {id}</h1>
        <div className="flex gap-2 items-center">
          <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest mr-2">Asiento activo:</span>
          {seats.map(s => (
            <button 
              key={`seat-btn-${s}`} 
              onClick={() => setActiveSeat(s)}
              className={`px-4 py-2 rounded-xl font-black transition-all ${activeSeat === s ? 'bg-green-500 text-black scale-110 shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'bg-gray-800 text-gray-500 hover:bg-gray-700'}`}
            >
              #{s}
            </button>
          ))}
          <button onClick={addSeat} className="bg-gray-700 hover:bg-gray-600 w-10 h-10 rounded-full font-black text-xl flex items-center justify-center">+</button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Panel de Productos */}
        <div className="w-2/3 p-6 overflow-y-auto bg-gray-900/50">
          {Object.keys(groupedProducts).map(cat => (
            <div key={`cat-${cat}`} className="mb-10">
              <h2 className="text-sm font-black mb-4 text-green-500/50 uppercase tracking-[0.2em] border-b border-gray-800 pb-2">{cat}</h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedProducts[cat].map(p => (
                  <div 
                    key={`prod-${p.id}`} 
                    onClick={() => p.stock > 0 && addProduct(p.id)} 
                    className={`p-4 rounded-2xl border-2 transition-all active:scale-95 shadow-xl ${p.stock <= 0 ? 'bg-gray-800/50 border-red-900/30 grayscale cursor-not-allowed' : 'bg-gray-800 border-transparent hover:border-green-500 hover:bg-gray-700 cursor-pointer'}`}
                  >
                    <div className="font-bold uppercase text-xs mb-1 text-gray-300">{p.name}</div>
                    <div className="text-green-400 font-black text-xl">${p.price.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Panel de Detalle (Ticket) */}
        <div className="w-1/3 bg-gray-950 p-6 border-l border-gray-800 flex flex-col shadow-inner">
          <h2 className="text-xl font-black mb-6 flex items-center gap-2">
            <span className="text-green-500">🧾</span> DETALLE DE CUENTA
          </h2>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {seats.map(seatNum => {
                const seatItems = items.filter(item => (item.seat_id || 1) === seatNum);
                const seatTotal = seatItems.reduce((acc, i) => acc + (i.quantity * (i.products?.price || 0)), 0);
                if (seatItems.length === 0 && seatNum !== activeSeat) return null;

                return (
                  <div key={`seat-group-${seatNum}`} className={`p-4 rounded-2xl border-2 transition-all ${activeSeat === seatNum ? 'border-green-500/50 bg-green-500/5' : 'border-gray-800 bg-gray-900/30'}`}>
                    <div className="flex justify-between items-center mb-3">
                      <span className={`text-xs font-black px-2 py-1 rounded-lg ${activeSeat === seatNum ? 'bg-green-500 text-black' : 'bg-gray-800 text-gray-400'}`}>
                        PERSONA #{seatNum}
                      </span>
                      <span className="font-black text-sm">${seatTotal.toLocaleString()}</span>
                    </div>
                    
                    <div className="space-y-2">
                      {seatItems.map(item => (
                        <div key={`item-${item.id}`} className="flex justify-between items-center text-[11px] bg-black/40 p-3 rounded-xl border border-white/5 group">
                          <div className="flex flex-col">
                            <span className="font-black text-gray-200 uppercase">{item.products?.name || 'Cargando...'}</span>
                            <span className="text-gray-500 text-[9px]">CANT: {item.quantity}</span>
                          </div>
                          <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all">
                            <button onClick={() => transferItem(item.id, seatNum)} className="hover:scale-125 transition-transform" title="Mover persona">🔄</button>
                            <button onClick={() => removeItem(item.id)} className="text-red-500 hover:scale-125 transition-transform" title="Quitar">❌</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
            })}
          </div>

          <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-800">
            <div className="flex justify-between text-3xl font-black mb-6">
              <span className="text-gray-500 text-sm self-center uppercase tracking-widest">Total</span>
              <span className="text-green-400">${total.toLocaleString()}</span>
            </div>
            
            <button 
              onClick={goToPayment} 
              disabled={items.length === 0}
              className="w-full py-5 rounded-2xl bg-green-600 hover:bg-green-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-black text-lg shadow-[0_10px_20px_rgba(22,163,74,0.2)] transition-all active:scale-95 mb-4"
            >
              IR A PAGAR
            </button>
            
            <button 
              onClick={cancelOrder} 
              className="w-full py-3 text-red-500/50 hover:text-red-500 font-bold text-xs uppercase tracking-widest transition-colors"
            >
              Cancelar Orden Completa
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}