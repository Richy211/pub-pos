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

  // 🔹 CARGAR RESUMEN
  useEffect(() => {
    const token = localStorage.getItem("token");

    api.get("/cash-close", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => setData(res.data))
    .catch(err => {
      console.error(err);
      alert("No autorizado");
    });
  }, []);

  // 🔹 CARGAR VENTAS POR DÍA
  useEffect(() => {
    const token = localStorage.getItem("token");

    api.get("/sales-by-day", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => setSalesByDay(res.data))
    .catch(err => console.error(err));
  }, []);

  // 📊 DATOS ÓRDENES
  const ordersChart = data ? [
    { name: "Pagadas", value: data.paid_orders },
    { name: "Canceladas", value: data.cancelled_orders }
  ] : [];

  // 💰 DATOS VENTAS
  const salesChart = data ? [
    { name: "Ventas", value: data.total_sales }
  ] : [];

  // 📈 FORMATEAR VENTAS POR DÍA
  const dailyChart = salesByDay.map(item => ({
    name: item.date?.split("T")[0],
    value: Number(item.total) || 0
  }));



  if (!data) return <p>Cargando cierre de caja...</p>;

  return (
    <div className="text-white">

      <h1 className="text-2xl mb-6">💰 Cierre de Caja</h1>

      {/* 🧾 RESUMEN */}
      <div className="space-y-4">

        <div className="bg-slate-800 p-4 rounded">
          <p>Total órdenes: {data.total_orders}</p>
        </div>

        <div className="bg-green-700 p-4 rounded">
          <p>Órdenes pagadas: {data.paid_orders}</p>
        </div>

        <div className="bg-red-700 p-4 rounded">
          <p>Órdenes canceladas: {data.cancelled_orders}</p>
        </div>

        <div className="bg-blue-700 p-4 rounded">
          <p>Total ventas: ${data.total_sales || 0}</p>
        </div>

        <div className="bg-yellow-700 p-4 rounded">
        <p>Total costos: ${data.total_cost || 0}</p>
        </div>

        <div className="bg-purple-700 p-4 rounded">
        <p>Utilidad: ${data.total_profit || 0}</p>
        </div>


        <div className="bg-purple-700 p-4 rounded">
          <p>Total ganancia: ${data.total_profit || 0}</p>
        </div>  

      </div>

      {/* 📊 ÓRDENES */}

      

      {/* 💰 VENTAS */}
      <div className="bg-slate-800 p-4 rounded mt-6">
        <h2 className="mb-4">💰 Ventas</h2>

          <ResponsiveContainer width="100%" height={300}>
  <BarChart data={dailyChart}>
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Bar dataKey="value" fill="#3b82f6" minPointSize={10} />
  </BarChart>
</ResponsiveContainer>



      </div>

      {/* 📈 VENTAS POR DÍA */}
      <div className="bg-slate-800 p-4 rounded mt-6">
        <h2 className="mb-4">📈 Ventas por día</h2>

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