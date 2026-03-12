import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { API } from "../services/api"

export default function Order(){

 const { tableId } = useParams()

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

 if(!order){
  return <p>Cargando...</p>
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

     <p>Items cargados: {items.length}</p>

    {items.map((item,i)=>(
  <div key={i}>
   {item.qty}x {item.name} - ${item.price}
  </div>
 ))}

   </div>

  </div>

 )
}