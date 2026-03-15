import { useEffect, useState } from "react"
import { API } from "../services/api"
import { useNavigate } from "react-router-dom"

export default function Tables(){

 const [tables,setTables] = useState([])
 const navigate = useNavigate()

 useEffect(()=>{
  loadTables()

  const interval = setInterval(()=>{
   loadTables()
  },2000)

  return ()=>clearInterval(interval)

 },[])

 const loadTables = ()=>{

  API.get("/tables")
   .then(res=>{
    setTables(res.data)
   })

 }

 const getColor = (table)=>{

  if(table.total > 0) return "#ff5a5a"   // roja ocupada
  return "#3bd16f"                       // verde disponible

 }

 return(

  <div style={{padding:"30px"}}>

   <h1 style={{marginBottom:"20px"}}>
    🍺 Mesas del Pub
   </h1>

   <div style={{
    display:"grid",
    gridTemplateColumns:"repeat(auto-fill, 170px)",
    gap:"20px"
   }}>

    {tables.map(table=>(

     <div
      key={table.id}
      onClick={()=>navigate(`/order/${table.id}`)}
      style={{
       height:"140px",
       borderRadius:"14px",
       background:getColor(table),
       color:"#fff",
       cursor:"pointer",
       display:"flex",
       flexDirection:"column",
       justifyContent:"center",
       alignItems:"center",
       fontWeight:"bold",
       boxShadow:"0 6px 14px rgba(0,0,0,0.2)",
       transition:"transform 0.2s"
      }}

      onMouseEnter={e=> e.currentTarget.style.transform="scale(1.05)"}
      onMouseLeave={e=> e.currentTarget.style.transform="scale(1)"}
     >

      <div style={{fontSize:"26px"}}>
       Mesa {table.number}
      </div>

      <div style={{marginTop:"8px", fontSize:"14px"}}>

       {table.total > 0
        ? "Ocupada"
        : "Disponible"}

      </div>

      {table.total > 0 && (

       <div style={{
        marginTop:"6px",
        fontSize:"16px"
       }}>
        ${table.total}
       </div>

      )}

     </div>

    ))}

   </div>

  </div>

 )

}