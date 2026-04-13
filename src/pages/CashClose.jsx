import { useEffect, useState } from "react";
import api from "../services/api";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const CashClose = () => {

  const [data, setData] = useState(null);
  const [salesByDay, setSalesByDay] = useState([]);

  // 🔹 CARGAR RESUMEN (SIN TOKEN MANUAL)
  useEffect(() => {
    api.get("/cash-close")
      .then(res => {
        console.log("CASH DATA:", res.data);
        setData(res.data);
      })
      .catch(err => {
        console.error("Error caja:", err);
        alert("Error cargando cierre de caja");
      });
  }, []);

  // 🔹 CARGAR VENTAS POR DÍA (SIN TOKEN MANUAL)
  useEffect(() => {
    api.get("/sales-by-day")
      .then(res => {
        console.log("SALES BY DAY:", res.data);
        setSalesByDay(res.data);
      })
      .catch(err => console.error("Error ventas por día:", err));
  }, []);

  // 📈 FORMATEAR VENTAS POR DÍA
  const dailyChart = salesByDay.map(item => ({
    name: item.date?.split("T")[0],
    value: Number(item.total) || 0
  }));

  if (!data) return <p className="text-white p-4">Cargando cierre de caja...</p>;

  return (
    <div className="text-white p-6">

      <h1 className="text-2xl mb-6 font-bold">💰 Cierre de Caja</h1>

      {/* 🧾 RESUMEN */}
      <div className="space-y-4">

        <div className="bg-slate-800 p-4 rounded">
          <p>📦 Órdenes: {data.total_ordenes}</p>
        </div>

        <div className="bg-green-700 p-4 rounded">
          <p>💵 Ventas: ${Number(data.total_ventas).toLocaleString()}</p>
        </div>

        <div className="bg-yellow-700 p-4 rounded">
          <p>📈 Utilidad: ${Number(data.total_utilidad).toLocaleString()}</p>
        </div>

      </div>

      {/* 📊 GRÁFICO VENTAS POR DÍA */}
      <div className="bg-slate-800 p-4 rounded mt-6">
        <h2 className="mb-4 font-semibold">📈 Ventas por día</h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dailyChart}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default CashClose;