import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { API } from "../services/api"

export default function Order(){

 const { tableId } = useParams()
 const navigate = useNavigate()

 const [products,setProducts] = useState([])
 const [order,setOrder] = useState(null)
 const [items,setItems] = useState([])

 useEffect(()=>{

  API.get(`/order/${tableId}`)
   .then(res=>{
    setOrder(res.data)
   })

  API.get("/products")
   .then(res=>{
    setProducts(res.data)
   })

 },[])

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

 const addProduct = (productId)=>{

  API.post("/order-item",{
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

 const goToPayment = ()=>{
  navigate(`/payment/${order.id}`)
 }



const removeItem = (id)=>{

 API.post("/remove-item",{
  order_item_id: id
 })
 .then(()=>{
  loadItems()
 })

}




 const payOrder = async () => {

 try {

  await API.post("/pay-order", {
   order_id: order.id
  })

  alert("✅ Pago realizado")

  navigate("/tables")

 } catch (error) {

  console.error(error)
  alert("Error al procesar pago")

 }

}

 const total = items.reduce((acc,item)=>{
  return acc + item.qty * item.price
 },0)

 if(!order){

  return(

   <div className="pos">

    <h2>Mesa {tableId}</h2>

    <button
     onClick={openOrder}
     style={{
      padding:"20px",
      fontSize:"18px"
     }}
    >
     Abrir mesa
    </button>

   </div>

  )

 }

 return(

  <div className="pos">

   <div className="products">

    {products.map(p=>(

     <button
      key={p.id}
      className="product-btn"
      onClick={()=>addProduct(p.id)}
     >
      <h3>{p.name}</h3>
      <p>${p.price}</p>
     </button>

    ))}

   </div>

   <div className="order">

    <h2>Pedido Mesa {tableId}</h2>

{items.map((item,i)=>(

 <div
  key={i}
  className="order-item"
  style={{
   display:"flex",
   justifyContent:"space-between",
   marginBottom:"6px"
  }}
 >

  <span>
   {item.qty}x {item.name} - ${item.price}
  </span>

  <button
   onClick={()=>removeItem(item.id)}
   style={{
    background:"#ff4d4d",
    border:"none",
    color:"white",
    borderRadius:"6px",
    padding:"4px 8px",
    cursor:"pointer"
   }}
  >
   ❌
  </button>

 </div>

))}

    <div className="order-total">

     <h2>Total: ${total}</h2>

     <button
      onClick={payOrder}
      style={{
       padding:"12px",
       background:"#28a745",
       color:"white",
       border:"none",
       borderRadius:"8px",
       marginTop:"10px"
      }}
     >
      Pagar
     </button>

    </div>

   </div>

  </div>

 )

}