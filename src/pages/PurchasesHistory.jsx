import { useEffect, useState } from "react";

export default function PurchasesHistory() {
  const [data, setData] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:5000/purchases", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(setData);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Historial de Compras</h1>

      <table className="w-full bg-slate-800 text-white rounded">
        <thead>
          <tr className="bg-slate-700">
            <th className="p-2">ID</th>
            <th className="p-2">Fecha</th>
            <th className="p-2">Proveedor</th>
            <th className="p-2">Total</th>
            <th className="p-2">Estado</th>
          </tr>
        </thead>

        <tbody>
          {data.map(p => (
            <tr key={p.id} className="border-t border-slate-600">
              <td className="p-2">{p.id}</td>
              <td className="p-2">
                {new Date(p.date).toLocaleString()}
              </td>
              <td className="p-2">{p.supplier}</td>
              <td className="p-2">${p.total}</td>
              <td className="p-2">{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}