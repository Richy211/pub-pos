import { useParams } from "react-router-dom"

export default function Order(){

 const { tableId } = useParams()

 return(
  <div style={{padding:"20px"}}>

   <h1>Pedido de Mesa {tableId}</h1>

   <p>Aquí agregaremos productos 🍺</p>

  </div>
 )
}