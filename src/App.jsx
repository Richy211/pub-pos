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
import AdminPurchases from "./pages/AdminPurchases";
import PurchasesHistory from "./pages/PurchasesHistory";

// 🔐 Decodificar token
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

function App() {

  const location = useLocation();
  const isLogin = location.pathname === "/login";

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role?.toLowerCase();
console.log("USER EN APP:", user);


  // 🔐 si no hay token → login
  if (!user) {
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

            {/* 🔓 RUTAS LIBRES */}
            <Route path="/" element={<Tables />} />
            <Route path="/tables" element={<Tables />} />
            <Route path="/order/:tableId" element={<Order />} />
            <Route path="/payment/:orderId" element={<Payment />} />

            {/* 🔐 SOLO ADMIN */}
            <Route 
              path="/cash-close"  
              element={
                <ProtectedRoute roles={["admin"]}>
                  <CashClose />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/products" 
              element={
                <ProtectedRoute roles={["admin"]}>
                  <Products />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/users" 
              element={
                <ProtectedRoute roles={["admin"]}>
                  <Users />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/purchases" 
              element={
                <ProtectedRoute roles={["admin"]}>
                  <Purchases />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/tax" 
              element={
                <ProtectedRoute roles={["admin"]}>
                  <Tax />
                </ProtectedRoute>
              } 
            />

            {/* OTROS */}
            <Route 
              path="/products/new" 
              element={
                <ProtectedRoute roles={["admin"]}>
                  <NewProduct />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/admin/purchases" 
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminPurchases />
                </ProtectedRoute>
              } 
            />

          <Route path="/purchases/history" element={<PurchasesHistory />} />


          </Routes>

        </div>
      </div>
    </div>
  );
}

export default App;