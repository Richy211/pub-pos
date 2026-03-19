import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { API } from "../services/api"

export default function Order(){

  const { tableId } = useParams()
  const navigate = useNavigate()

  const [products,setProducts] = useState([])
  const [order,setOrder] = useState(null)
  const [items,setItems] = useState([])

useEffect(() => {

  // 🔥 obtener orden existente
  API.get(`/orders/table/${tableId}`)
    .then(res => {
      if(res.data){
        setOrder(res.data)
      } else {
        openOrder() // 👈 crear automáticamente
      }
    })

  // 🔥 productos
  API.get("/products")
    .then(res => {
      setProducts(res.data)
    })

}, [])




  useEffect(()=>{
    if(order){
      loadItems()
    }
  },[order])

  const openOrder = ()=>{

    API.post("/open-order",{
      table_id: tableId
    })
    .then(res=>{
      setOrder(res.data)
    })

  }

  const addProduct = (productId) => {

  if(!order){
    console.log("No hay orden");
    return;
  }

  API.post("/order-items",{
    order_id: order.id,
    product_id: productId
  })
  .then(()=> {
    loadItems()
  })

}
  
  const loadItems = ()=>{

    API.get(`/order-items/${order.id}`)
    .then(res=>{
      setItems(res.data)
    })

  }

  const removeItem = (id)=>{

    API.post("/remove-item",{
      order_item_id: id
    })
    .then(()=>{
      loadItems()
    })

  }

  const goToPayment = ()=>{
    navigate(`/payment/${order.id}`)
  }

  const total = items.reduce((acc,item)=>{
    return acc + item.qty * item.price
  },0)

    const eliminarProducto = async (id) => {
      await API.delete(`/order-items/${id}`);
      loadOrderItems(); // 🔥 recarga lista
    };

    const loadOrderItems = () => {
  API.get(`/order-items/${orderId}`)
    .then(res => setItems(res.data));
};

  // 🧠 SI NO EXISTE ORDEN
  if(!order){
    return(
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">

        <h2 className="text-2xl mb-6">
          Mesa {tableId}
        </h2>

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
    <div>

      {/* 🔥 HEADER */}
      <div className="bg-gray-950 border-b border-gray-800 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-green-400">
          🍺 Pub POS
        </h1>
        <div className="text-sm text-gray-400">
          Mesa {tableId}
        </div>
      </div>

      <div className="min-h-screen bg-gray-900 text-white flex">

        {/* 🧾 IZQUIERDA (PRODUCTOS) */}
        <div className="w-2/3 p-6">

          <h1 className="text-2xl font-bold mb-4">
            🍻 Pedido
          </h1>

          <div className="mb-4 text-lg">
            Total actual: 
            <span className="font-bold text-green-400 ml-2">
              ${total.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {products.map(product => (
              <div
                key={product.id}
                onClick={() => addProduct(product.id)}
                className="bg-gray-800 hover:bg-green-600 active:scale-95 transition-all p-4 rounded-xl cursor-pointer shadow-md"
              >
                <div className="text-lg font-semibold">
                  {product.name}
                </div>

                <div className="text-sm text-gray-400">
                  ${product.price}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* 🧾 DERECHA (DETALLE) */}
        <div className="w-1/3 bg-gray-800 p-6 border-l border-gray-700 flex flex-col">

          <h2 className="text-xl font-bold mb-4">
            🧾 Pedido ({items.length})
          </h2>

          <div className="flex-1 overflow-y-auto">


             {items.map(item => (
    <div key={item.id} className="flex justify-between items-center mb-2">

      <span>{item.name} x{item.qty}</span>

      <div className="flex gap-2 items-center">

        <span>${(item.qty * item.price).toLocaleString()}</span>

        <button
          onClick={() => eliminarProducto(item.id)}
          className="bg-red-500 hover:bg-red-600 px-2 py-1 rounded text-sm"
        >
          ❌
        </button>

      </div>

    </div>
  ))}



          </div>

          <div className="border-t border-gray-600 pt-4">

            <div className="flex justify-between text-xl font-bold mb-4">
              <span>Total</span>
              <span>${total.toLocaleString()}</span>
            </div>

            <button
              onClick={goToPayment}
              className="w-full bg-green-500 hover:bg-green-600 p-4 rounded-xl font-bold text-lg"
            >
              💳 Ir a pagar
            </button>

          </div>

        </div>

      </div>

    </div>
  )
}