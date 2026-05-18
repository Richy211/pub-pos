import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../services/api";
import { generateTicket } from "../services/ticketGenerator";

export default function Tables() {
  const [tables, setTables] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  const loadTables = () => {
    api.get("/tables")
      .then(res => {
        console.log("DATA:", res.data);
        setTables(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => console.error(err));
  };

  // Carga inicial
  useEffect(() => {
    loadTables();
  }, []);

  // Refresca cada vez que se navega a /tables (al volver de pagar)
  useEffect(() => {
    loadTables();
  }, [location.pathname]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderId = params.get("orderId");

    if (params.get("success") === "true" && orderId) {
      toast.success("Venta finalizada");

      api.get(`/order-items/${orderId}`)
        .then(res => {
          const items = res.data;
          const total = items.reduce((acc, i) => acc + (i.quantity * i.price), 0);

          let waiterName = "GarzÃ³n";
          try {
            const token = localStorage.getItem("token");
            if (token) waiterName = JSON.parse(atob(token.split(".")[1])).username;
          } catch (e) {}

          generateTicket({ order_id: orderId, items, total, waiter: waiterName });
          navigate("/tables", { replace: true });
        })
        .catch(err => console.error("Error al recuperar datos para ticket", err));
    }
  }, [location]);

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tables.map(table => {
          const isOccupied = table.status === "occupied";
          return (
            <div
              key={table.id}
              onClick={() => navigate(`/order/${table.id}`)}
              className={`p-10 rounded-2xl text-center font-bold text-white cursor-pointer transition-all hover:scale-105 ${
                isOccupied ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
              }`}
            >
              <div className="text-2xl">Mesa {table.number}</div>
              <div className="mt-1 text-white/80 text-sm">
                {isOccupied ? "Ocupada" : "Libre"}
              </div>
              {isOccupied && Number(table.total) > 0 && (
                <div className="mt-2 text-white font-black text-xl">
                  ${Number(table.total).toLocaleString("es-CL")}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
