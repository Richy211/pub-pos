import ProductForm from "../components/ProductForm";
import { createProduct } from "../services/products";
import { useNavigate } from "react-router-dom";

function NewProduct() {
  const navigate = useNavigate();

  const handleCreate = async (data) => {
    await createProduct(data);
    navigate("/products");
  };

  return (
    <div className="p-6">
      <ProductForm onSubmit={handleCreate} />
    </div>
  );
}

export default NewProduct;