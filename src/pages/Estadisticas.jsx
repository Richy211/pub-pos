import { useEffect, useState } from "react";
import api from "../services/api";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#8dd1e1", "#a4de65", "#d0ed57"];

export default function Estadisticas() {
  const [datos, setDatos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 

  useEffect(() => {
    // Llamada al endpoint de reportes
    api.get("/reportes/movimiento-productos") 
      .then(res => {
        setDatos(res.data);
      })
      .catch(err => {
        console.error("Error al cargar estadísticas:", err);
      });
  }, []);

  // Lógica de paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = datos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(datos.length / itemsPerPage) || 1;

  // Mapeo de datos para el gráfico (usando los nombres del backend)
  const chartData = currentItems.map(item => ({
    name: item.producto,
    value: Number(item.cantidad_ventas) || 0
  })).filter(item => item.value > 0);

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6 text-green-400 text-center uppercase tracking-tighter">📊 Monitor de Ventas</h1>

      {/* TABLA DE PRODUCTOS */}
      <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-6 border border-gray-700 max-w-4xl mx-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-700 text-gray-400 text-xs uppercase">
            <tr>
              <th className="p-3">Producto</th>
              <th className="p-3 text-center">Ventas</th>
              <th className="p-3 text-center">Stock Actual</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {currentItems.length > 0 ? (
              currentItems.map((p) => (
                <tr key={p.id} className="hover:bg-gray-750 transition-colors">
                  <td className="p-3 font-medium text-sm">{p.producto}</td>
                  <td className="p-3 text-center text-green-400 font-bold">{p.cantidad_ventas}</td>
                  <td className="p-3 text-center text-gray-500 text-sm">{p.stock_actual}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="p-6 text-center text-gray-500 italic">Cargando datos...</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* PAGINACIÓN */}
        <div className="p-3 bg-gray-750 flex justify-between items-center border-t border-gray-700">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="px-3 py-1 bg-gray-700 rounded-md disabled:opacity-30 text-xs hover:bg-gray-600 transition-all"
          >
            Ant.
          </button>
          <span className="text-[10px] text-gray-500 uppercase font-bold">Pág {currentPage} / {totalPages}</span>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="px-3 py-1 bg-gray-700 rounded-md disabled:opacity-30 text-xs hover:bg-gray-600 transition-all"
          >
            Sig.
          </button>
        </div>
      </div>

      {/* GRÁFICO DE IMPACTO */}
      <div className="bg-gray-800 p-6 rounded-3xl border border-gray-700 shadow-2xl max-w-4xl mx-auto">
        <h3 className="text-lg font-bold text-center mb-4 text-gray-400">Distribución de Impacto (Vista Actual)</h3>
        <div className="h-[500px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%" cy="50%"
                  outerRadius={160} 
                  innerRadius={60}  
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend iconType="diamond" verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-600 italic">
              Sin datos de venta suficientes para mostrar el gráfico.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}