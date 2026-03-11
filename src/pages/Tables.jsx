import { useEffect, useState } from "react"
import { API } from "../services/api"
import { useNavigate } from "react-router-dom"

export default function Tables(){

 const [tables,setTables] = useState([])
 const navigate = useNavigate()

 useEffect(()=>{
  API.get("/tables")
   .then(res=>{
    setTables(res.data)
   })
 },[])

 return(
  <div style={{padding:"20px"}}>

   <h2>Mesas del Pub</h2>

   <div style={{
    display:"grid",
    gridTemplateColumns:"repeat(4, 150px)",
    gap:"20px",
    marginTop:"20px"
   }}>

    {tables.map(table=>(
     <div
      key={table.id}
      onClick={() => navigate(`/order/${table.id}`)}
      style={{
       border:"1px solid #ccc",
       padding:"20px",
       textAlign:"center",
       borderRadius:"10px",
       background: table.status === "free" ? "#9cff9c" : "#ff9c9c",
       cursor:"pointer"
      }}
     >
      <h3>Mesa {table.number}</h3>
      <p>{table.status}</p>
     </div>
    ))}

   </div>

  </div>
 )
}