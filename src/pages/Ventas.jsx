import { useEffect, useState } from "react";
import api from "../services/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Ventas() {
  const [stats, setStats] = useState({
    totalVentas: 0,
    utilidad: 0,
    ordenesPagadas: 0,
    dataGrafico: []
  });

  useEffect(() => {
    api.get("/reportes/ventas-totales")
      .then(res => {
        setStats({
          totalVentas: res.data.totalVentas || 0,
          utilidad: res.data.utilidad || 0,
          ordenesPagadas: res.data.ordenesPagadas || 0,
          dataGrafico: res.data.dataGrafico || []
        });
      })
      .catch(err => console.error("Error al cargar ventas:", err));
  }, []);

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6">📊 Reporte de Ventas</h1>

      {/* TARJETAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-600 p-6 rounded-xl shadow-lg">
          <p className="text-blue-100 text-sm uppercase font-bold">Total Ventas</p>
          <h2 className="text-3xl font-bold">${Number(stats.totalVentas).toLocaleString()}</h2>
        </div>
        <div className="bg-purple-600 p-6 rounded-xl shadow-lg">
          <p className="text-purple-100 text-sm uppercase font-bold">Utilidad Neta</p>
          <h2 className="text-3xl font-bold">${Number(stats.utilidad).toLocaleString()}</h2>
        </div>
        <div className="bg-green-600 p-6 rounded-xl shadow-lg">
          <p className="text-green-100 text-sm uppercase font-bold">Órdenes Finalizadas</p>
          <h2 className="text-3xl font-bold">{stats.ordenesPagadas}</h2>
        </div>
      </div>

<div className="bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
  <h3 className="text-xl font-bold mb-4">Ventas por Día</h3>
  
  {/* USAMOS aspect={2} para que el gráfico siempre mantenga una forma proporcional
      independiente de la pantalla, o fijamos el height en el ResponsiveContainer
  */}
  <div className="w-full" style={{ minHeight: '350px' }}> 
    <ResponsiveContainer width="100%" height={350}>
      <BarChart 
        data={stats.dataGrafico}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
        <XAxis 
          dataKey="fecha" 
          stroke="#9CA3AF" 
          tickFormatter={(val) => val ? val.substring(5, 10) : ''} 
        />
        <YAxis stroke="#9CA3AF" />
        <Tooltip 
  labelFormatter={(value) => {
    if (!value) return "";
    return new Date(value).toLocaleDateString('es-ES'); // Esto lo deja como 08/04/2026
  }}
  formatter={(value) => [`$${Number(value).toLocaleString()}`, "Ventas"]}
/>
        <Bar 
        dataKey="total" 
        fill="#3B82F6" 
        radius={[4, 4, 0, 0]}
        isAnimationActive={false} 
/>
  
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>






    </div>
  );
}