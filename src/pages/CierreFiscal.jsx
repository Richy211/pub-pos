import { useEffect, useState } from "react";
import api from "../services/api";

export default function CierreFiscal() {
  const [rentabilidad, setRentabilidad] = useState({ 
    ventas_brutas: 0, 
    costo_total: 0, 
    utilidad_neta: 0 
  });
  const [iva, setIva] = useState({ 
    iva_credito: 0, 
    iva_debito: 0 
  });

  const cargarDatos = async () => {
    try {
      // Llamamos a los dos endpoints al mismo tiempo
      const [resRen, resIva] = await Promise.all([
        api.get("/admin/resumen-rentabilidad"),
        api.get("/admin/resumen-fiscal")
      ]);
      setRentabilidad(resRen.data);
      setIva(resIva.data);
    } catch (error) {
      console.error("Error cargando datos fiscales:", error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-8">📊 Resumen Fiscal y Rentabilidad</h1>

      {/* --- Fila 1: Resumen de IVA --- */}
      <h2 className="text-xl font-bold mb-4">⚖️ Situación Fiscal</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-red-900/30 p-6 rounded-xl border border-red-500">
           <p className="text-gray-400">IVA Débito</p>
           <h2 className="text-3xl font-bold">${Number(iva.iva_debito).toLocaleString()}</h2>
        </div>
        <div className="bg-green-900/30 p-6 rounded-xl border border-green-500">
           <p className="text-gray-400">IVA Crédito</p>
           <h2 className="text-3xl font-bold">${Number(iva.iva_credito).toLocaleString()}</h2>
        </div>
        <div className="bg-blue-900/30 p-6 rounded-xl border border-blue-500">
           <p className="text-gray-400">IVA a Pagar</p>
           <h2 className="text-3xl font-bold text-blue-400">
             ${(iva.iva_debito - iva.iva_credito).toLocaleString()}
           </h2>
        </div>
      </div>

      {/* --- Fila 2: Rentabilidad del Mes --- */}
      <h2 className="text-xl font-bold mb-4">💰 Rentabilidad del Mes</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
           <p className="text-gray-400">Ventas Brutas</p>
           <h2 className="text-3xl font-bold text-white">${Number(rentabilidad.ventas_brutas).toLocaleString()}</h2>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
           <p className="text-gray-400">Costos (Insumos)</p>
           <h2 className="text-3xl font-bold text-red-400">${Number(rentabilidad.costo_total).toLocaleString()}</h2>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
           <p className="text-gray-400">Utilidad Neta</p>
           <h2 className="text-3xl font-bold text-green-400">${Number(rentabilidad.utilidad_neta).toLocaleString()}</h2>
        </div>
      </div>
    </div>
  );
}