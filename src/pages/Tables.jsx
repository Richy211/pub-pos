import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../services/api";
import { generateTicket } from "../services/ticketGenerator";

export default function Tables() {
  const [tables, setTables] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
   api.get("/tables").then(res => {
  console.log("DATA:", res.data);
  setTables(Array.isArray(res.data) ? res.data : []);
}).catch(err => console.error(err));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderId = params.get("orderId");

    if (params.get("success") === "true" && orderId) {
      // 1. Mostrar aviso
      toast.success("Venta finalizada");

      // 2. Pedir los datos al servidor para el ticket
      api.get(`/order-items/${orderId}`)
        .then(res => {
          const items = res.data;
          const total = items.reduce((acc, i) => acc + (i.quantity * i.price), 0);
          
          let waiterName = "Garzón";
          try {
            const token = localStorage.getItem("token");
            if (token) waiterName = JSON.parse(atob(token.split(".")[1])).username;
          } catch (e) {}

          // 3. Generar PDF
          generateTicket({ order_id: orderId, items, total, waiter: waiterName });
          
          // 4. Limpiar URL para que no pestañee más
          navigate("/tables", { replace: true });
        })
        .catch(err => console.error("Error al recuperar datos para ticket", err));
    }
  }, [location]);

  // ... tu return de mesas igual que siempre ...
  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tables.map(table => (
          <div key={table.id} onClick={() => navigate(`/order/${table.id}`)}
            className={`p-10 rounded-2xl text-center font-bold text-white cursor-pointer ${table.status === 'occupied' ? 'bg-red-500' : 'bg-green-500'}`}>
            Mesa {table.number}
          </div>
        ))}
      </div>
    </div>
  );
}