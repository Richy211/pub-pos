import { useParams, useNavigate } from "react-router-dom"
import { API } from "../services/api"
import { useEffect, useState } from "react"

export default function Payment(){

 const { orderId } = useParams()
 const navigate = useNavigate()

 const [items,setItems] = useState([])

 useEffect(()=>{

  API.get(`/order-items/${orderId}`)
   .then(res=>{
    setItems(res.data)
   })

 },[])

 const total = items.reduce((acc,item)=>{
  return acc + item.qty * item.price
 },0)

 const pay = ()=>{

  API.post("/pay-order",{order_id:orderId})
   .then(()=>{
    navigate("/tables")
   })

 }

 return(

  <div style={{padding:"20px"}}>

   <h2>Pagar Pedido</h2>

   <h1>Total: ${total}</h1>

   <button onClick={pay}>
    Confirmar Pago
   </button>

  </div>

 )
}