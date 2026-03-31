import { useState } from "react";
import { createPurchase } from "../services/purchaseService";

const PurchaseForm = () => {
  const [supplierId, setSupplierId] = useState("");
  const [products, setProducts] = useState([]);
  const [currentProduct, setCurrentProduct] = useState({
    product_id: "",
    quantity: "",
    unit_price: "",
  });

  const token = localStorage.getItem("token");

  const addProduct = () => {
    if (!currentProduct.product_id) return;

    setProducts([...products, currentProduct]);
    setCurrentProduct({ product_id: "", quantity: "", unit_price: "" });
  };

  const removeProduct = (index) => {
    const updated = products.filter((_, i) => i !== index);
    setProducts(updated);
  };

  const calculateTotal = () => {
    return products.reduce(
      (acc, p) => acc + p.quantity * p.unit_price,
      0
    );
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        supplier_id: supplierId,
        products: products.map((p) => ({
          product_id: Number(p.product_id),
          quantity: Number(p.quantity),
          unit_price: Number(p.unit_price),
        })),
      };

      await createPurchase(payload, token);

      alert("Compra creada correctamente");

      setProducts([]);
      setSupplierId("");
    } catch (error) {
      console.error(error);
      alert("Error al crear compra");
    }
  };

  return (
    <div className="space-y-4">

      {/* Proveedor */}
      <input
        type="number"
        value={supplierId}
        onChange={(e) => setSupplierId(e.target.value)}
        className="border p-2 bg-white text-black w-full"
      />

      {/* Agregar producto */}
      <div className="grid grid-cols-3 gap-2">
        <input
          type="number"
          value={currentProduct.product_id}
          onChange={(e) =>
            setCurrentProduct({ 
              ...currentProduct, 
              product_id: 
              e.target.value, })
          }
         className="border p-2 bg-white text-black w-full"
        />
        <input
          type="number"
          placeholder="Cantidad"
          value={currentProduct.quantity}
          onChange={(e) =>
            setCurrentProduct({ ...currentProduct, quantity: e.target.value })
          }
          className="border p-2 bg-white text-black w-full"
        />
        <input
          type="number"
          placeholder="Precio"
          value={currentProduct.unit_price}
          onChange={(e) =>
            setCurrentProduct({ ...currentProduct, unit_price: e.target.value })
          }
          className="border p-2 bg-white text-black w-full"
        />
      </div>

      <button
        onClick={addProduct}
        className="bg-blue-500 text-white px-4 py-2"
      >
        Agregar producto
      </button>

      {/* Lista */}
      <div>
        <h2 className="font-bold">Productos agregados</h2>

        {products.map((p, index) => (
          <div key={index} className="flex justify-between border p-2 mt-2">
            <span>
              ID: {p.product_id} | Cant: {p.quantity} | Precio: {p.unit_price}
            </span>
            <button
              onClick={() => removeProduct(index)}
              className="text-red-500"
            >
              X
            </button>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="font-bold">
        Total Neto: ${calculateTotal()}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="bg-green-600 text-white px-4 py-2"
      >
        Crear compra
      </button>
    </div>
  );
};

export default PurchaseForm;