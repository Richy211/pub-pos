import { useEffect, useState } from "react"
import { API } from "../services/api"
import { useNavigate } from "react-router-dom"

export default function Tables(){

 const [tables,setTables] = useState([])
 const navigate = useNavigate()

 useEffect(()=>{
  loadTables()
 },[])

 const loadTables = ()=>{

  API.get("/tables")
   .then(res=>{
    setTables(res.data)
   })

 }

 return(
  <div style={{padding:"20px"}}>

   <h2>Mesas del Pub</h2>

   <div style={{
    display:"grid",
    gridTemplateColumns:"repeat(4, 160px)",
    gap:"20px",
    marginTop:"20px"
   }}>

    {tables.map(table=>(

     <div
      key={table.id}
      onClick={() => navigate(`/order/${table.id}`)}
      style={{
       border:"1px solid #ccc",
       padding:"15px",
       textAlign:"center",
       borderRadius:"12px",
       background: table.status === "free" ? "#8aff8a" : "#ff8a8a",
       cursor:"pointer",
       boxShadow:"0 4px 10px rgba(0,0,0,0.1)"
      }}
     >

      <h3>Mesa {table.number}</h3>

      <p>
       {table.status === "free"
        ? "Disponible"
        : "Ocupada"}
      </p>

      {table.total > 0 && (
 <p style={{fontWeight:"bold"}}>
  Total: ${table.total}
 </p>
)}

      {/* si luego agregamos total en backend se verá aquí */}

     </div>

    ))}

   </div>

  </div>
 )
}