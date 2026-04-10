import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Tables from "./pages/Tables";
import Order from "./pages/Order";
import Payment from "./pages/Payment";
import Ventas from "./pages/Ventas";
import AdminVentas from "./pages/AdminVentas";
import Products from "./pages/Products";
import Users from "./pages/Users";
import Login from "./pages/Login";
import CashClose from "./pages/CashClose";

function App() {
  const token = localStorage.getItem("token");

  return (
    <div className="flex bg-gray-900 min-h-screen text-white font-sans">
      {token && <Sidebar />}
      
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Operación (Importante el :id) */}
          <Route path="/tables" element={<Tables />} />
          <Route path="/order/:id" element={<Order />} />
          <Route path="/payment/:id" element={<Payment />} />
          
          {/* Gestión */}
          <Route path="/products" element={<Products />} />
          <Route path="/users" element={<Users />} />
          <Route path="/ventas" element={<Ventas />} />
          <Route path="/admin-ventas" element={<AdminVentas />} />
          <Route path="/cash-close" element={<CashClose />} />

          <Route path="/" element={token ? <Navigate to="/tables" /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;