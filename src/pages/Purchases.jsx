import { useState, useEffect } from "react";

export default function Purchases() {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  const [supplier, setSupplier] = useState("");
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [items, setItems] = useState([]);

  const [success, setSuccess] = useState(false);

  // 🔥 cargar datos
  useEffect(() => {
    fetch("http://localhost:5000/suppliers")
      .then(res => res.json())
      .then(data => setSuppliers(data));

    fetch("http://localhost:5000/products")
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  // 🔥 agregar producto
  const addItem = () => {
    if (!product || quantity <= 0) return;

    const selectedProduct = products.find(p => p.id == product);

    const newItem = {
      product_id: product,
      name: selectedProduct?.name,
      quantity: Number(quantity),
      price: selectedProduct?.price || 0,
    };

    setItems([...items, newItem]);

    // limpiar inputs
    setProduct("");
    setQuantity(1);
  };

  // 🔥 total
  const total = items.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0
  );

  // 🔥 submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!supplier || items.length === 0) {
      alert("Completa proveedor y agrega productos");
      return;
    }

    const token = localStorage.getItem("token");

    const purchase = {
      supplier_id: supplier,
      products: items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.price,
      })),
    };

    try {
      const res = await fetch("http://localhost:5000/purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(purchase),
      });

      const data = await res.json();

      console.log("RESPUESTA:", data);

      // ✅ mostrar éxito
      setSuccess(true);

      // ✅ limpiar TODO
      setSupplier("");
      setProduct("");
      setQuantity(1);
      setItems([]);

      // 🔥 ocultar mensaje después de 3 seg
      setTimeout(() => setSuccess(false), 3000);

    } catch (error) {
      console.error("ERROR:", error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Formulario de Compras</h1>

      {/* ✅ MENSAJE ÉXITO */}
      {success && (
        <div className="bg-green-600 text-white p-3 rounded shadow">
          ✅ Compra guardada correctamente
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* PROVEEDOR */}
        <div>
          <label>Proveedor</label>
          <select
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            className="w-full p-2 rounded bg-slate-800 text-white"
          >
            <option value="">Seleccione proveedor</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* PRODUCTO */}
        <div>
          <label>Producto</label>
          <select
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            className="w-full p-2 rounded bg-slate-800 text-white"
          >
            <option value="">Seleccione producto</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* CANTIDAD */}
        <div>
          <label>Cantidad</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full p-2 rounded bg-slate-800 text-white"
            min="1"
          />
        </div>

        {/* BOTÓN AGREGAR */}
        <button
          type="button"
          onClick={addItem}
          className="bg-blue-600 px-3 py-2 rounded"
        >
          + Agregar producto
        </button>

        {/* LISTA */}
        <div>
          <h2 className="font-bold">Productos agregados</h2>
          {items.map((item, i) => (
            <div key={i} className="flex justify-between bg-slate-800 p-2 rounded mt-2">
              <span>{item.name}</span>
              <span>{item.quantity} x ${item.price}</span>
            </div>
          ))}
        </div>

        {/* TOTAL */}
        <div className="font-bold text-green-400">
          Total compra: ${total}
        </div>

        {/* GUARDAR */}
        <button
          type="submit"
          className="bg-green-600 px-4 py-2 rounded"
        >
          Guardar compra
        </button>

      </form>
    </div>
  );
}