import PurchaseForm from "../components/PurchaseForm";

const AdminPurchases = () => {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Compras de Insumos</h1>
      <PurchaseForm />
    </div>
  );
};

export default AdminPurchases;