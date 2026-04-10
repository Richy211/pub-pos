import React from 'react';

const PurchaseTable = ({ data, refreshData }) => {
  
  // Función para formatear la fecha de forma legible
  const formatDate = (dateString) => {
    if (!dateString) return "Sin fecha";
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-700 text-gray-400 text-sm uppercase">
            <th className="py-3 px-4">ID</th>
            <th className="py-3 px-4">Fecha</th>
            <th className="py-3 px-4">Proveedor</th>
            <th className="py-3 px-4 text-right">Neto</th>
            <th className="py-3 px-4 text-right">IVA</th>
            <th className="py-3 px-4 text-right">Total</th>
            <th className="py-3 px-4 text-center">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {data.length > 0 ? (
            data.map((compra) => (
              <tr key={compra.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="py-3 px-4 text-gray-500">#{compra.id}</td>
                <td className="py-3 px-4">{formatDate(compra.date)}</td>
                <td className="py-3 px-4 font-medium text-blue-400">
                  {compra.proveedor_nombre || 'Desconocido'}
                </td>

                <td className="py-3 px-4 text-right">
                  ${Number(compra.total_net || 0).toLocaleString()}
                </td>

                <td className="py-3 px-4 text-right text-gray-500">
                  ${Number(compra.iva).toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right font-bold text-green-400">
                  ${Number(compra.total || 0).toLocaleString()}
                </td>


                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    compra.status === 'recibido' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
                  }`}>
                    {compra.status}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="py-10 text-center text-gray-500">
                No hay registros de compras disponibles.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PurchaseTable;