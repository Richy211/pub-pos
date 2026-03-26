import { useEffect, useState } from "react"
import api from "../services/api"
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


const loadTables = () => {
  api.get("/tables")
    .then(res => {
      setTables(res.data);
    })
    .catch(err => {
      console.error("Error cargando mesas", err);
    });
};



return (
  <div className="min-h-screen p-6 bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-white">

    {/* 🔥 BOTÓN CIERRE DE CAJA */}
    <button
      onClick={() => navigate("/cash-close")}
      className="mb-6 bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl font-bold"
    >
      💰 Cierre de caja
    </button>

    {/* GRID MESAS */}
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

 
{tables.map(table => {

  const isOccupied = table.status === "occupied"

  return (
    <div
      key={table.id}
      onClick={() => navigate(`/order/${table.id}`)}
      className={`
        cursor-pointer rounded-2xl p-6 text-center
        transition-all duration-300 shadow-lg
        transform hover:scale-105
        ${isOccupied 
          ? "bg-red-500 hover:bg-red-600" 
          : "bg-green-500 hover:bg-green-600"}
      `}
    >

      <div className="text-3xl font-bold">
        Mesa {table.number}
      </div>

      <div className="mt-2 text-white/80">
        {isOccupied ? "Ocupada" : "Disponible"}
      </div>

    </div>
  )
})}




    </div>

  </div>
 )

}