import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../services/api";
import ding from "../assets/sounds/ding.mp3"
import { useRef } from "react"

export default function Order(){

  const { tableId } = useParams()
  const navigate = useNavigate()

  const [products,setProducts] = useState([])
  const [order,setOrder] = useState(null)
  const [items,setItems] = useState([])
  const sound = new Audio(ding)
  const prevItemsRef = useRef([])

  useEffect(() => {
  if (items.length > prevItemsRef.current.length) {
    sound.currentTime = 0
    sound.play().catch(() => {})
  }

  prevItemsRef.current = items
}, [items])

  useEffect(() => {
    loadOrder()
    loadProducts()
  }, [tableId])

  const loadOrder = async () => {
    const res = await api.get(`/orders/table/${tableId}`)
    setOrder(res.data)
  }

  const loadProducts = async () => {
    const res = await api.get("/products")
    setProducts(res.data)
  }

  useEffect(()=>{
    if(order){
      loadItems(order.id)
    }
  },[order])

  const loadItems = async (orderId) => {
    const res = await api.get(`/order-items/${orderId}`)
    setItems(res.data)
  }

  const openOrder = async ()=>{
    const res = await api.post("/open-order",{ table_id: tableId })
    setOrder(res.data)
  }

  const addProduct = async (productId) => {
    if(!order){
      alert("Primero abre la mesa")
      return
    }

    await api.post("/order-items",{
      order_id: order.id,
      product_id: productId,
      quantity: 1
    })

    loadItems(order.id)
  }

  const removeItem = async (id)=>{
    await api.post("/remove-item",{ order_item_id: id })
    loadItems(order.id)
  }

  const cancelOrder = async () => {
    await api.post("/cancel-order",{ order_id: order.id })
    navigate("/")
  }

  const payOrder = async () => {
    await api.post("/pay-order",{ order_id: order.id })
    navigate("/")
  }

  const total = items.reduce((acc,item)=>{
    return acc + item.quantity * item.price
  },0)

  if(!order){
    return(
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <h2 className="text-2xl mb-6">Mesa {tableId}</h2>
        <button
          onClick={openOrder}
          className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-xl font-bold"
        >
          Abrir mesa
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">

      {/* PRODUCTOS */}
      <div className="w-2/3 p-6">

        <h1 className="text-2xl font-bold mb-4">🍻 Pedido</h1>

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
              className="bg-gray-800 hover:bg-green-600 transition p-4 rounded-xl cursor-pointer"
            >
              <div className="text-lg">{product.name}</div>
              <div className="text-sm text-gray-400">${product.price}</div>
            </div>
          ))}
        </div>

      </div>

      {/* DETALLE */}
      <div className="w-1/3 bg-gray-800 p-6">

        <h2 className="text-xl font-bold mb-4">
          Pedido ({items.length})
        </h2>

        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="flex justify-between">

              <span>{item.name} x{item.quantity}</span>

              <div className="flex gap-2">
                <span>${(item.quantity * item.price).toLocaleString()}</span>

                <button
                  onClick={() => removeItem(item.id)}
                  className="bg-red-500 px-2 rounded"
                >
                  ❌
                </button>
              </div>

            </div>
          ))}
        </div>

        <div className="mt-6 border-t pt-4">

          <div className="flex justify-between text-xl font-bold">
            <span>Total</span>
            <span>${total.toLocaleString()}</span>
          </div>

          <button
            onClick={payOrder}
            className="w-full mt-4 bg-green-500 hover:bg-green-600 p-3 rounded-xl font-bold"
          >
            💳 Pagar
          </button>

          <button
            onClick={cancelOrder}
            className="w-full mt-2 bg-red-500 hover:bg-red-600 p-3 rounded-xl font-bold"
          >
            ❌ Cancelar
          </button>

        </div>

      </div>

    </div>
  )
}