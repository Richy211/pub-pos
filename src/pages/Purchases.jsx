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

export default function Purchases() {

  const [data, setData] = useState(null);
  const [salesByDay, setSalesByDay] = useState([]);

  // 🔹 RESUMEN GENERAL
  useEffect(() => {
    api.get("/cash-close")
      .then(res => {
        console.log("RESUMEN:", res.data);
        setData(res.data);
      })
      .catch(err => console.error("Error resumen:", err));
  }, []);

  // 🔹 VENTAS POR DÍA
  useEffect(() => {
    api.get("/sales-by-day")
      .then(res => {
        console.log("SALES BY DAY RAW:", res.data);
        setSalesByDay(res.data);
      })
      .catch(err => console.error("Error sales-by-day:", err));
  }, []);

  // 🔥 TRANSFORMACIÓN CLAVE (AQUÍ ESTABA EL PROBLEMA)
  const chartData = salesByDay.map(item => ({
    name: item.date?.split("T")[0],
    value: Number(item.total) || 0
  }));

  console.log("CHART DATA:", chartData);

  if (!data) return <p className="text-white p-4">Cargando reporte...</p>;

  return (
    <div className="p-6 text-white">

      <h1 className="text-2xl font-bold mb-6">📊 REPORTE DE VENTAS</h1>

      {/* 🔹 TARJETAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        <div className="bg-blue-600 p-4 rounded-xl">
          <p className="text-sm">VENTAS TOTALES</p>
          <h2 className="text-2xl font-bold">
            ${Number(data.total_ventas).toLocaleString()}
          </h2>
        </div>

        <div className="bg-purple-600 p-4 rounded-xl">
          <p className="text-sm">UTILIDAD</p>
          <h2 className="text-2xl font-bold">
            ${Number(data.total_utilidad).toLocaleString()}
          </h2>
        </div>

        <div className="bg-green-600 p-4 rounded-xl">
          <p className="text-sm">ÓRDENES</p>
          <h2 className="text-2xl font-bold">
            {data.total_ordenes}
          </h2>
        </div>

      </div>

      {/* 🔹 GRÁFICO */}
      <div className="bg-slate-800 p-4 rounded mt-6 h-[350px]">
        <h2 className="mb-4 font-semibold">📈 Ventas Diarias</h2>

        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
            <Bar dataKey="value" fill="#22c55e" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 🔹 BOTÓN REFRESH */}
      <button
        onClick={() => window.location.reload()}
        className="mt-6 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
      >
        🔄 Refrescar datos
      </button>

    </div>
  );
}