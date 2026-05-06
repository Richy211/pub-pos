import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../services/api";

export default function Order() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);

  // --- NUEVO: Estado para manejar los asientos ---
  const [seats, setSeats] = useState([1]); // Empezamos con el Asiento 1
  const [activeSeat, setActiveSeat] = useState(1); // El asiento que está seleccionado para recibir pedidos

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
    api.get(`/order_items/${orderId}`)
      .then(res => setItems(res.data))
      .catch(err => console.error("Error items", err));
  }

const openOrder = () => {
  api.post("/open_order", { table_id: id })
    .then(res => setOrder(res.data))
    .catch(err => {
      if (err.response?.status === 400) {
        // Si ya existe, intentamos cargarla de nuevo en lugar de dar error
        loadOrder();
      } else {
        alert("Error al abrir mesa");
      }
    });
}




  // --- MODIFICADO: Ahora incluimos el seat_id al enviar al backend ---
  const addProduct = (productId) => {
    if (!order?.id) return;
    api.post("/order_items", { 
        order_id: order.id, 
        product_id: productId,
        seat_id: activeSeat // <--- Enviamos a qué asiento pertenece
      })
      .then(() => {
        loadItems(order.id);
        loadProducts();
      })
      .catch(err => {
        const msg = err.response?.data?.message || "Error al agregar";
        alert(msg);
      });
  };

  // --- MODIFICADO: Asegúrate de que el ID coincida con tu ruta de Express ---
const removeItem = (itemId) => {
  // Verificamos en consola qué ID estamos mandando
  console.log("Eliminando item ID:", itemId);
  api.delete(`/order_items/${itemId}`)
    .then(() => {
      loadItems(order.id);
      loadProducts();
    })
    .catch(err => console.error("Error al eliminar:", err));
};

// --- NUEVO: Función para trasladar de persona ---
const transferItem = (itemId, currentSeat) => {
  // Si tenemos 2 asientos, el destino del 1 es el 2, y viceversa. 
  // O podemos abrir un pequeño prompt para preguntar el número.
  const targetSeat = prompt("¿A qué persona quieres mover este producto?", currentSeat === 1 ? 2 : 1);
  
  if (targetSeat) {
    api.put(`/order_items/${itemId}/transfer`, { seat_id: targetSeat })
      .then(() => {
        loadItems(order.id);
      })
      .catch(err => alert("Error al trasladar"));
  }
};

// Función para cancelar
const cancelOrder = () => {
  if (window.confirm("¿Estás seguro de cancelar TODA la orden? Se perderán los datos y se restaurará el stock.")) {
    api.post(`/orders/${order.id}/cancel`)
      .then(() => {
        alert("Orden cancelada");
        navigate("/"); // Volvemos al salón principal
      })
      .catch(err => console.error("Error al cancelar", err));
  }
};



  // --- NUEVO: Función para agregar un asiento nuevo ---
  const addSeat = () => {
    const nextSeat = seats.length + 1;
    setSeats([...seats, nextSeat]);
    setActiveSeat(nextSeat); // Seleccionamos el nuevo automáticamente
  };

  const goToPayment = () => navigate(`/payment/${order.id}`);
  
  // Total general
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
        
        {/* NUEVO: Selector de Asientos en la cabecera o panel lateral */}
        <div className="flex gap-2 items-center">
          <span className="text-sm text-gray-400 mr-2 font-bold">ASIENTO ACTIVO:</span>
          {seats.map(s => (
            <button 
              key={s}
              onClick={() => setActiveSeat(s)}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${activeSeat === s ? 'bg-green-500 text-black scale-110 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-gray-800 text-gray-400'}`}
            >
              #{s}
            </button>
          ))}
          <button 
            onClick={addSeat}
            className="bg-gray-700 hover:bg-gray-600 w-10 h-10 rounded-full font-bold flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* PANEL IZQUIERDO: PRODUCTOS (Se mantiene igual) */}
        <div className="w-2/3 p-6 overflow-y-auto">
          {Object.keys(groupedProducts).map(cat => (
            <div key={cat} className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-green-400 border-b border-gray-800 pb-2 capitalize">{cat}</h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedProducts[cat].map(p => {
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
                      <div className={`absolute -top-2 -right-2 px-2 py-0.5 rounded text-[10px] font-black shadow-md border ${
                        isOutOfStock ? 'bg-red-600 border-red-400 text-white' : isLowStock ? 'bg-orange-500 border-orange-300 text-white animate-pulse' : 'bg-green-600 border-green-400 text-white'
                      }`}>
                        {isOutOfStock ? 'AGOTADO' : `STK: ${p.stock}`}
                      </div>
                      <div className="font-bold uppercase text-sm mb-1">{p.name}</div>
                      <div className="text-green-400 font-black text-lg">${p.price}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* PANEL DERECHO: DETALLE AGRUPADO POR ASIENTO */}
        <div className="w-1/3 bg-gray-950 p-6 border-l border-gray-800 flex flex-col">
          <h2 className="text-xl font-bold mb-4">🧾 Detalle por Personas</h2>
          <div className="flex-1 overflow-y-auto space-y-6">
            {seats.map(seatNum => {
                const seatItems = items.filter(item => {
                // Si item.seat_id no existe, asumimos que es de la persona 1
                const itemSeat = item.seat_id || 1; 
                return Number(itemSeat) === Number(seatNum);
                });
                
                const seatTotal = seatItems.reduce((acc, i) => acc + (i.quantity * i.price), 0);
                
                if (seatItems.length === 0 && seatNum !== activeSeat) return null;

                return (
                    <div key={seatNum} className={`p-3 rounded-xl border ${activeSeat === seatNum ? 'border-green-500 bg-gray-900' : 'border-gray-800 bg-gray-950 opacity-80'}`}>
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-black text-green-400">Persona #{seatNum}</span>
                            <span className="text-sm font-bold">${seatTotal.toLocaleString()}</span>
                        </div>
                        <div className="space-y-1">
                            {seatItems.map(item => (
  <div key={item.id} className="flex justify-between text-xs bg-black/30 p-2 rounded items-center group">
    <div className="flex flex-col">
      <span className="font-bold">{item.name} x{item.quantity}</span>
      <span className="text-gray-500">${(item.quantity * item.price).toLocaleString()}</span>
    </div>
    
    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      {/* BOTÓN TRASLADAR (Ícono de intercambio) */}
      <button 
        onClick={() => transferItem(item.id, seatNum)}
        title="Mover a otra persona"
        className="text-blue-400 hover:scale-125 transition-transform"
      >
        🔄
      </button>

      {/* BOTÓN ELIMINAR (El que te daba 404) */}
      <button 
        onClick={() => removeItem(item.id)} 
        title="Eliminar"
        className="text-red-500 hover:scale-125 transition-transform"
      >
        ❌
      </button>
    </div>
  </div>
))}



                        </div>
                    </div>
                );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-800">
            <div className="flex justify-between text-2xl font-bold mb-4">
              <span>Total Mesa</span> <span className="text-green-400">${total.toLocaleString()}</span>
            </div>
            <button 
              disabled={items.length === 0}
              onClick={goToPayment} 
              className={`w-full p-4 rounded-xl font-bold text-lg transition-colors ${
                items.length === 0 ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              Ir a pagar / Dividir
            </button>

              <button 
                onClick={cancelOrder}
                className="w-full mt-3 p-3 rounded-xl font-bold text-red-500 border border-red-900/50 hover:bg-red-900/20 transition-colors"
              >
                🚫 Cancelar Orden
              </button>


          </div>
        </div>
      </div>
    </div>
  )
}