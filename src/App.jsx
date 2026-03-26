import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Tables from "./pages/Tables";
import Order from "./pages/Order";
import Payment from "./pages/Payment";
import CashClose from "./pages/CashClose";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Products from "./pages/Products";
import Users from "./pages/Users";
import Purchases from "./pages/Purchases";
import Tax from "./pages/Tax";
import NewProduct from "./pages/NewProduct";
import products from "./pages/Products";

// 🔐 Decodificar token
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

function App() {
  const token = localStorage.getItem("token");

  const user = token ? parseJwt(token) : null;
  const role = user?.role?.toLowerCase();

  const location = useLocation();
  const isLogin = location.pathname === "/login";

  // 🔐 si no hay token → login
  if (!token) {
    return <Login />;
  }

  return isLogin ? (
    <Routes>
      <Route path="/login" element={<Login />} />
    </Routes>
  ) : (
    <div className="flex min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-white">
      
      <Sidebar />

      <div className="flex-1 p-6">
        <div className="bg-slate-900 rounded-2xl p-6 shadow-lg min-h-full">

          <Routes>
            {/* 🔓 RUTAS LIBRES (admin + garzón) */}
            <Route path="/" element={<Tables />} />
            <Route path="/tables" element={<Tables />} />
            <Route path="/order/:tableId" element={<Order />} />
            <Route path="/payment/:orderId" element={<Payment />} />
            <Route path="/cash-close"  element={role === "admin" ? <CashClose /> : <Tables />} />

            <Route path="/cash-close"  element={<ProtectedRoute roles={["admin"]}><CashClose /></ProtectedRoute> } />

            <Route path="/products" element={role === "admin" ? <Products /> : <Tables />} />
            <Route path="/users" element={role === "admin" ? <Users /> : <Tables />} />
            <Route path="/purchases" element={role === "admin" ? <Purchases /> : <Tables />} />
            <Route path="/tax" element={role === "admin" ? <Tax /> : <Tables />} />

 <Route
    path="/products"
    element={
      <ProtectedRoute>
        <Products />
      </ProtectedRoute>
    }
  />

  <Route
    path="/products/new"
    element={
      <ProtectedRoute>
        <NewProduct />
      </ProtectedRoute>
    }
  />
            

          </Routes>

        </div>
      </div>
    </div>
  );
}

export default App;