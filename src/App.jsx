import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Tables from "./pages/Tables";
import Products from "./pages/Products";     // Antes decía Inventory
import Purchases from "./pages/Purchases";   // Antes decía Compras
import Estadisticas from "./pages/Estadisticas";
import CashClose from "./pages/CashClose";     // Antes decía CierreDiario
import Login from "./pages/Login";
import Users from "./pages/Users";
import Sidebar from "./components/Sidebar";
import AdminVentas from "./pages/AdminVentas";

function App() {
  return (
    <Router>
      <div className="flex">
        {/* El Sidebar estará siempre a la izquierda */}
        <Sidebar />
        
        <div className="flex-1 bg-gray-900 min-h-screen">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/tables" element={<Tables />} />
            <Route path="/inventory" element={<Products />} /> 
            <Route path="/compras" element={<Purchases />} />
            <Route path="/estadisticas" element={<Estadisticas />} />
            <Route path="/admin-ventas" element={<AdminVentas />} />
            <Route path="/cierre-diario" element={<CashClose />} />
            <Route path="/users" element={<Users />} />
            {/* Si no encuentra la ruta, nos manda a mesas */}
            <Route path="*" element={<Tables />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;