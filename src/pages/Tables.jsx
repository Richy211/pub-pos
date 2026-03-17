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

 return (
  <div className="min-h-screen bg-gray-900 text-white p-6">

      {/* HEADER */}
    <div className="bg-gray-950 border-b border-gray-800 p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-green-400">
        🍺 Pub POS
      </h1>
      <div className="text-sm text-gray-400">
        Garzón
      </div>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

      {tables.map(table => {
        const isOccupied = table.total > 0

        return (
          <div
            key={table.id}
            onClick={() => navigate(`/order/${table.id}`)}
            className={`
              cursor-pointer rounded-2xl p-6 text-center
              transition-all duration-200 shadow-lg
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

            {isOccupied && (
              <div className="mt-2 text-lg font-semibold">
                ${table.total.toLocaleString()}
              </div>
            )}

          </div>
        )
      })}

    </div>

  </div>
)


 /* return(


  
  <div className="min-h-screen bg-gray-900 text-white p-6">

   <h1 className="text-3xl font-bold mb-6">
    🍺 Mesas del Pub
   </h1>


   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

    {tables.map(table=>{

     const isOccupied = table.total > 0

     return (

      <div
       key={table.id}
       onClick={()=>navigate(`/order/${table.id}`)}
       className={`
        cursor-pointer rounded-2xl p-6 text-center
        transition-all duration-200
        shadow-lg
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

       {isOccupied && (
        <div className="mt-2 text-lg font-semibold">
         ${table.total.toLocaleString()}
        </div>
       )}

      </div>

     )

    })}

   </div>

  </div>

 ) */

}