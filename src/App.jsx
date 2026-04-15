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

// 🔐 Función para extraer el rol del token (la misma lógica que usaste en el Sidebar)
function getRole() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    // Decodificamos la parte media del JWT
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role?.toLowerCase();
  } catch (error) {
    return null;
  }
}

function App() {
  const token = localStorage.getItem("token");
  const role = getRole();

  return (
    <div className="flex bg-gray-900 min-h-screen text-white font-sans">
      {/* Solo mostramos el Sidebar si hay un token (usuario logueado) */}
      {token && <Sidebar />}
      
      <div className="flex-1 overflow-auto">
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<Login />} />
          
          {/* 🍽️ RUTAS DE OPERACIÓN (Acceso para Admin y Garzón) */}
          <Route path="/tables" element={token ? <Tables /> : <Navigate to="/login" />} />
          <Route path="/order/:id" element={token ? <Order /> : <Navigate to="/login" />} />
          <Route path="/payment/:id" element={token ? <Payment /> : <Navigate to="/login" />} />
          <Route path="/cash-close" element={token ? <CashClose /> : <Navigate to="/login" />} />

          {/* 🛡️ RUTAS PROTEGIDAS (Solo para el Admin "Richy") */}
          <Route 
            path="/products" 
            element={role === "admin" ? <Products /> : <Navigate to="/tables" />} 
          />
          <Route 
            path="/users" 
            element={role === "admin" ? <Users /> : <Navigate to="/tables" />} 
          />
          <Route 
            path="/ventas" 
            element={role === "admin" ? <Ventas /> : <Navigate to="/tables" />} 
          />
          <Route 
            path="/admin-ventas" 
            element={role === "admin" ? <AdminVentas /> : <Navigate to="/tables" />} 
          />

          {/* Redirecciones automáticas */}
          <Route path="/" element={token ? <Navigate to="/tables" /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;