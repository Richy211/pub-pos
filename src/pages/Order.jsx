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
    // Corregido: Filtro estándar para encontrar la mesa abierta
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

  // CORREGIDO: Ahora busca los items filtrando por order_id (evita el 404)
  const loadItems = (orderId) => {
    api.get(`/order_items?order_id=eq.${orderId}`)
      .then(res => setItems(res.data || []))
      .catch(err => console.error("Error items", err));
  }

  const openOrder = () => {
    api.post("/open_order", { table_id: id, status: 'open' })
      .then(() => {
        loadOrder();
      })
      .catch(err => {
        if (err.response?.status === 400) {
          loadOrder();
        } else {
          alert("Error al abrir mesa");
        }
      });
  }

  const addProduct = (productId) => {
    if (!order?.id) return;
    api.post("/order_items", { 
        order_id: order.id, 
        product_id: productId,
        seat_id: activeSeat,
        quantity: 1 // Aseguramos que envíe cantidad
      })
      .then(() => {
        loadItems(order.id);
      })
      .catch(err => {
        alert("Error al agregar producto");
      });
  };

  // ANTICIPACIÓN: Corregido para que borre el item específico por su ID
  const removeItem = (itemId) => {
    if (!window.confirm("¿Quitar este producto?")) return;
    api.delete(`/order_items?id=eq.${itemId}`)
      .then(() => {
        loadItems(order.id);
      })
      .catch(err => console.error("Error al eliminar:", err));
  };

  // ANTICIPACIÓN: Corregido para usar PATCH (estándar de Supabase para editar)
  const transferItem = (itemId, currentSeat) => {
    const targetSeat = prompt("¿A qué persona quieres mover este producto?", currentSeat === 1 ? 2 : 1);
    
    if (targetSeat) {
      api.patch(`/order_items?id=eq.${itemId}`, { seat_id: parseInt(targetSeat) })
        .then(() => {
          loadItems(order.id);
        })
        .catch(err => alert("Error al trasladar"));
    }
  };

  // ANTICIPACIÓN: Corregido para cerrar/borrar la orden de la mesa
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
  
  const total = items.reduce((acc, item) => acc + (Number(item.quantity || 1) * Number(item.price || 0)), 0);

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <h2 className="text-2xl mb-6">Mesa {id}</h2>
        <button onClick={openOrder} className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-xl font-bold transition-transform active:scale-95">
          Abrir mesa
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="bg-gray-950 p-4 flex justify-between items-center border-b border-gray-800">
        <h1 className="text-xl font-bold text-green-400">🍺 Pub POS - Mesa {id}</h1>
        <div className="flex gap-2 items-center">
          <span className="text-sm text-gray-400 mr-2 font-bold uppercase">Asiento:</span>
          {seats.map(s => (
            <button 
              key={s}
              onClick={() => setActiveSeat(s)}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${activeSeat === s ? 'bg-green-500 text-black scale-110 shadow-lg' : 'bg-gray-800 text-gray-400'}`}
            >
              #{s}
            </button>
          ))}
          <button onClick={addSeat} className="bg-gray-700 hover:bg-gray-600 w-10 h-10 rounded-full font-bold">+</button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Productos */}
        <div className="w-2/3 p-6 overflow-y-auto">
          {Object.keys(groupedProducts).map(cat => (
            <div key={cat} className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-green-400 border-b border-gray-800 pb-2 capitalize">{cat}</h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedProducts[cat].map(p => (
                  <div 
                    key={p.id} 
                    onClick={() => p.stock > 0 && addProduct(p.id)} 
                    className={`relative p-4 rounded-xl transition-all active:scale-95 shadow-lg border-2 ${p.stock <= 0 ? 'bg-gray-800 opacity-50 grayscale cursor-not-allowed' : 'bg-gray-800 border-transparent hover:border-green-500 cursor-pointer'}`}
                  >
                    <div className="font-bold uppercase text-sm mb-1">{p.name}</div>
                    <div className="text-green-400 font-black text-lg">${p.price}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Detalle */}
        <div className="w-1/3 bg-gray-950 p-6 border-l border-gray-800 flex flex-col">
          <h2 className="text-xl font-bold mb-4">🧾 Detalle</h2>
          <div className="flex-1 overflow-y-auto space-y-4">
            {seats.map(seatNum => {
                const seatItems = items.filter(item => (item.seat_id || 1) === seatNum);
                const seatTotal = seatItems.reduce((acc, i) => acc + (i.quantity * i.price), 0);
                if (seatItems.length === 0 && seatNum !== activeSeat) return null;

                return (
                  <div key={seatNum} className={`p-3 rounded-xl border ${activeSeat === seatNum ? 'border-green-500 bg-gray-900' : 'border-gray-800 opacity-60'}`}>
                    <div className="flex justify-between mb-2">
                      <span className="font-black text-green-400">Persona #{seatNum}</span>
                      <span className="font-bold">${seatTotal.toLocaleString()}</span>
                    </div>
                    {seatItems.map(item => (
                      <div key={item.id} className="flex justify-between text-xs bg-black/30 p-2 mb-1 rounded group">
                        <span>{item.name} x{item.quantity}</span>
                        <div className="flex gap-2">
                          <button onClick={() => transferItem(item.id, seatNum)}>🔄</button>
                          <button onClick={() => removeItem(item.id)}>❌</button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-800">
            <div className="flex justify-between text-2xl font-bold mb-4">
              <span>Total</span> <span className="text-green-400">${total.toLocaleString()}</span>
            </div>
            <button onClick={goToPayment} disabled={items.length === 0} className="w-full p-4 rounded-xl bg-green-600 hover:bg-green-700 font-bold disabled:opacity-50">
              Pagar / Dividir
            </button>
            <button onClick={cancelOrder} className="w-full mt-3 p-3 text-red-500 border border-red-900/50 rounded-xl">
              Cancelar Orden
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}