import { useEffect, useState } from "react";
import api from "../services/api";
import * as XLSX from 'xlsx';

export default function Arqueo() {
  const [esperado, setEsperado] = useState(0);
  const [real, setReal] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [historial, setHistorial] = useState([]);
  const [detalleMesas, setDetalleMesas] = useState([]);

  const loadData = async () => {
    try {
      const [resEsp, resHist, resDetalle] = await Promise.all([
        api.get("/admin/cierre-diario/total-esperado"),
        api.get("/admin/arqueo/historial"),
        api.get("/admin/cierre-diario/detalle-mesas")
      ]);
      setEsperado(resEsp.data.esperado || 0);
      setHistorial(resHist.data);
      setDetalleMesas(resDetalle.data);
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGuardar = async () => {
    if (!real) return alert("Por favor ingresa el monto real contado");
    
    try {
      await api.post("/admin/arqueo", { 
        total_esperado: esperado, 
        total_real: parseFloat(real), 
        observaciones 
      });
      alert("Arqueo guardado exitosamente");
      setReal("");
      setObservaciones("");
      loadData(); 
    } catch (e) {
      alert("Error al guardar arqueo");
    }
  };

  const exportarExcel = () => {
    const datosFormateados = historial.map(h => ({
      Fecha: h.fecha.split('T')[0],
      Esperado: h.total_esperado,
      Real: h.total_real,
      Diferencia: h.diferencia,
      Observaciones: h.observaciones
    }));

    const worksheet = XLSX.utils.json_to_sheet(datosFormateados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Historial_Arqueos");
    XLSX.writeFile(workbook, `Arqueos_${new Date().toLocaleDateString()}.xlsx`);
  };

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">💰 Arqueo de Caja</h1>
      
      {/* Sección Superior: Totales y Mesas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-blue-900/30 p-6 rounded-xl border border-blue-500">
          <p className="text-gray-400">Total Esperado (Sistema)</p>
          <h2 className="text-4xl font-bold mb-4">${Number(esperado).toLocaleString()}</h2>
          
          <h4 className="text-sm text-gray-300 font-semibold mb-2 border-t border-blue-500/30 pt-3">
            Desglose por Mesas:
          </h4>
          <div className="flex flex-wrap gap-2">
            {detalleMesas.map(m => (
              <span key={m.mesa} className="bg-blue-950 px-2 py-1 rounded text-xs border border-blue-800">
                Mesa {m.mesa}: ${Number(m.total_mesa).toLocaleString()}
              </span>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-600">
          <label className="block text-gray-400 mb-2">Total Real (Contado)</label>
          <input 
            type="number" 
            className="w-full bg-gray-700 p-3 rounded text-xl" 
            placeholder="0"
            value={real} 
            onChange={(e) => setReal(e.target.value)} 
          />
          <textarea 
            className="w-full mt-4 bg-gray-700 p-3 rounded" 
            placeholder="Observaciones..." 
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)} 
          />
        </div>
      </div>

      <button 
        onClick={handleGuardar} 
        className="bg-green-600 hover:bg-green-700 transition-colors px-8 py-3 rounded-lg font-bold w-full"
      >
        Cerrar Caja y Guardar Arqueo
      </button>

      {/* Historial de Arqueos */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">📜 Historial de Arqueos</h2>
          <button onClick={exportarExcel} className="bg-emerald-600 hover:bg-emerald-700 text-sm px-4 py-2 rounded font-semibold">
            📊 Exportar a Excel
          </button>
        </div>
        
        <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
          <table className="w-full text-left">
            <thead className="bg-gray-700 text-gray-300">
              <tr>
                <th className="p-4">Fecha</th>
                <th className="p-4">Esperado</th>
                <th className="p-4">Real</th>
                <th className="p-4">Diferencia</th>
                <th className="p-4">Obs.</th>
              </tr>
            </thead>
            <tbody>
              {historial.length > 0 ? (
                historial.map((h) => (
                  <tr key={h.id} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="p-4">{h.fecha.split('T')[0]}</td>
                    <td className="p-4">${Number(h.total_esperado).toLocaleString()}</td>
                    <td className="p-4">${Number(h.total_real).toLocaleString()}</td>
                    <td className={`p-4 font-bold ${h.diferencia < 0 ? 'text-red-500' : 'text-green-500'}`}>
                      ${Number(h.diferencia).toLocaleString()}
                    </td>
                    <td className="p-4 text-sm text-gray-400">{h.observaciones}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">No hay arqueos registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}