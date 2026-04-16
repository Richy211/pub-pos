import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Tables from "./pages/Tables";
import Products from "./pages/Products";     
import Purchases from "./pages/Purchases";   
import Estadisticas from "./pages/Estadisticas";
import CashClose from "./pages/CashClose";     
import Login from "./pages/Login";
import Users from "./pages/Users";
import Order from "./pages/Order";           
import Payment from "./pages/Payment"; // <--- ASEGÚRATE DE QUE ESTO ESTÉ
import AdminVentas from "./pages/AdminVentas";
import Sidebar from "./components/Sidebar";
import { ToastContainer } from "react-toastify"; // Para que se vean los avisos
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <Router>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 bg-gray-900 min-h-screen">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/tables" />} />
            <Route path="/tables" element={<Tables />} />
            
            {/* RUTAS DE VENTA - ESTO ES LO QUE TE FALTA */}
            <Route path="/order/:id" element={<Order />} />
            <Route path="/payment/:id" element={<Payment />} /> 
            
            <Route path="/inventory" element={<Products />} /> 
            <Route path="/compras" element={<Purchases />} />
            <Route path="/estadisticas" element={<Estadisticas />} />
            <Route path="/cierre-diario" element={<CashClose />} />
            <Route path="/admin-ventas" element={<AdminVentas />} />
            <Route path="/users" element={<Users />} />

            <Route path="*" element={<Tables />} />
          </Routes>
        </div>
      </div>
      {/* ToastContainer debe estar aquí para que los mensajes aparezcan */}
      <ToastContainer theme="dark" />
    </Router>
  );
}

export default App;