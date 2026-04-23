import { useEffect, useState } from "react";
import api from "../services/api";

export default function CierreFiscal() {
  const [data, setData] = useState({ iva_credito: 0, iva_debito: 0 });

  useEffect(() => {
    api.get("/admin/resumen-fiscal").then(res => setData(res.data));
  }, []);

  const totalPagar = Math.max(0, data.iva_debito - data.iva_credito);

  return (
    <div className="p-8 text-white max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">⚖️ Resumen Fiscal del Mes</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-red-900/30 p-6 rounded-2xl border border-red-500/50">
          <p className="text-gray-400">IVA Débito (Ventas)</p>
          <h2 className="text-3xl font-bold text-red-400">${Math.round(data.iva_debito).toLocaleString('es-CL')}</h2>
        </div>
        <div className="bg-green-900/30 p-6 rounded-2xl border border-green-500/50">
          <p className="text-gray-400">IVA Crédito (Compras)</p>
          <h2 className="text-3xl font-bold text-green-400">${Math.round(data.iva_credito).toLocaleString('es-CL')}</h2>
        </div>
        <div className="bg-blue-900/30 p-6 rounded-2xl border border-blue-500/50">
          <p className="text-gray-400">IVA a Pagar</p>
          <h2 className="text-3xl font-bold text-blue-400">${Math.round(totalPagar).toLocaleString('es-CL')}</h2>
        </div>
      </div>
    </div>
  );
}