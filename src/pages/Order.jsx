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
    // Filtro estándar para buscar la mesa
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
    // JOIN crítico para traer nombres y precios de productos
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

  // CORREGIDO: Filtro en la URL para evitar el 405 Method Not Allowed
  const removeItem = (itemId) => {
    if (!window.confirm("¿Quitar este producto?")) return;
    api.delete(`/order_items?id=eq.${itemId}`)
      .then(() => {
        loadItems(order.id);
      })
      .catch(err => {
        console.error("Error al eliminar:", err);
        alert("No se pudo eliminar");
      });
  };

  // CORREGIDO: PATCH con filtro en la URL para trasladar
  const transferItem = (itemId, currentSeat) => {
    const targetSeat = prompt("¿A qué persona mover?", currentSeat === 1 ? 2 : 1);
    if (targetSeat && !isNaN(targetSeat)) {
      api.patch(`/order_items?id=eq.${itemId}`, { seat_id: parseInt(targetSeat) })
        .then(() => {
          loadItems(order.id);
        })
        .catch(err => alert("Error al trasladar"));
    }
  };

  // CORREGIDO: Delete con filtro en URL para cancelar
  const cancelOrder = () => {
    if (window.confirm("¿Cancelar TODA la orden?")) {
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
        <h2 className="text-2xl mb-6 font-bold uppercase tracking-tighter">Mesa {id}</h2>
        <button onClick={openOrder} className="bg-green-600 hover:bg-green-500 px-10 py-5 rounded-2xl font-black text-xl shadow-2xl transition-all active:scale-95">
          ABRIR MESA
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans">
      <div className="bg-gray-950 p-4 flex justify-between items-center border-b border-gray-800">
        <h1 className="text-xl font-black text-green-400">🍺 Pub POS - Mesa {id}</h1>
        <div className="flex gap-2 items-center">
          {seats.map(s => (
            <button 
              key={`seat-${s}`} 
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
        {/* Productos */}
        <div className="w-2/3 p-6 overflow-y-auto">
          {Object.keys(groupedProducts).map(cat => (
            <div key={`cat-${cat}`} className="mb-8">
              <h2 className="text-xs font-black mb-4 text-green-500/50 uppercase tracking-widest border-b border-gray-800 pb-1">{cat}</h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedProducts[cat].map(p => (
                  <div 
                    key={`p-${p.id}`} 
                    onClick={() => p.stock > 0 && addProduct(p.id)} 
                    className={`p-4 rounded-2xl border-2 transition-all active:scale-95 ${p.stock <= 0 ? 'bg-gray-800 opacity-50 cursor-not-allowed' : 'bg-gray-800 border-transparent hover:border-green-500 cursor-pointer'}`}
                  >
                    <div className="font-bold text-xs mb-1 text-gray-400 uppercase">{p.name}</div>
                    <div className="text-green-400 font-black text-xl">${p.price.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Detalle Ticket */}
        <div className="w-1/3 bg-gray-950 p-6 border-l border-gray-800 flex flex-col">
          <h2 className="text-xl font-black mb-6">🧾 CUENTA</h2>
          <div className="flex-1 overflow-y-auto space-y-4">
            {seats.map(seatNum => {
                const seatItems = items.filter(item => (item.seat_id || 1) === seatNum);
                const seatTotal = seatItems.reduce((acc, i) => acc + (i.quantity * (i.products?.price || 0)), 0);
                if (seatItems.length === 0 && seatNum !== activeSeat) return null;

                return (
                  <div key={`group-${seatNum}`} className={`p-4 rounded-2xl border ${activeSeat === seatNum ? 'border-green-500/50 bg-green-500/5' : 'border-gray-800 bg-gray-900/40'}`}>
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-black text-xs text-green-400">PERSONA #{seatNum}</span>
                      <span className="font-black text-sm">${seatTotal.toLocaleString()}</span>
                    </div>
                    <div className="space-y-2">
                      {seatItems.map(item => (
                        <div key={`item-${item.id}`} className="flex justify-between items-center text-[11px] bg-black/40 p-3 rounded-xl group">
                          <span className="font-bold uppercase">{item.products?.name || '...'}</span>
                          <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all">
                            <button onClick={() => transferItem(item.id, seatNum)}>🔄</button>
                            <button onClick={() => removeItem(item.id)} className="text-red-500">❌</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
            })}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-800">
            <div className="flex justify-between text-3xl font-black mb-6">
              <span className="text-gray-500 text-sm self-center uppercase">Total</span>
              <span className="text-green-400">${total.toLocaleString()}</span>
            </div>
            <button onClick={goToPayment} disabled={items.length === 0} className="w-full py-5 rounded-2xl bg-green-600 hover:bg-green-500 font-black text-lg disabled:opacity-20 shadow-lg">
              IR A PAGAR
            </button>
            <button onClick={cancelOrder} className="w-full mt-4 text-[10px] text-red-500/50 uppercase font-bold tracking-widest">
              Cancelar mesa
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}