import { useEffect, useState } from "react";
import api from "../services/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function Ventas() {
  const [stats, setStats] = useState({
    totalVentas: 0,
    utilidad: 0,
    ordenesPagadas: 0,
    dataGrafico: []
  });

  const loadData = () => {
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
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6 text-green-400 font-mono">📊 REPORTE DE VENTAS</h1>

      {/* TARJETAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-600 p-6 rounded-xl border border-blue-400">
          <p className="text-xs uppercase font-black">Ventas Totales</p>
          <h2 className="text-4xl font-black">${Number(stats.totalVentas).toLocaleString('es-CL')}</h2>
        </div>
        <div className="bg-purple-600 p-6 rounded-xl border border-purple-400">
          <p className="text-xs uppercase font-black">Utilidad</p>
          <h2 className="text-4xl font-black">${Number(stats.utilidad).toLocaleString('es-CL')}</h2>
        </div>
        <div className="bg-green-600 p-6 rounded-xl border border-green-400">
          <p className="text-xs uppercase font-black">Órdenes</p>
          <h2 className="text-4xl font-black">{stats.ordenesPagadas}</h2>
        </div>
      </div>

      {/* GRÁFICO CON TAMAÑO FIJO (PARA MATAR EL BUG) */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 overflow-x-auto">
        <h3 className="text-xl font-bold mb-6">Ventas Diarias</h3>
        
<BarChart 
  width={800} 
  height={400} 
  data={stats.dataGrafico}
  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
>
  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
  <XAxis dataKey="fecha" stroke="#9CA3AF" />
  <YAxis stroke="#9CA3AF" />
  <Tooltip 
    contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
    // Aseguramos que busque la propiedad 'total' que viene del backend
    formatter={(value) => [`$${Number(value).toLocaleString('es-CL')}`, "Venta"]}
  />
  <Bar dataKey="total" fill="#3B82F6" />
</BarChart>



      </div>
      
      <button 
        onClick={loadData}
        className="mt-6 bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-bold"
      >
        REFRESCAR DATOS
      </button>
    </div>
  );
}