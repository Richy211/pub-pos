import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Box, 
  ShoppingCart, 
  BarChart3, 
  LogOut,
  ClipboardList 
} from "lucide-react"; 

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const token = localStorage.getItem("token");
  let user = null;

  // Intentamos decodificar, pero si falla no rompemos la app
  if (token && token.includes('.')) {
    try {
      const base64Url = token.split('.')[1];
      if (base64Url) {
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        user = JSON.parse(window.atob(base64));
      }
    } catch (e) {
      console.warn("Token mal formateado, ignorando...");
    }
  }
  
  // Mientras estés en tu casa (localhost o IP), eres ADMIN por decreto
  // Esto asegura que veas el menú completo pase lo que pase con el token
  const isAdmin = user?.role === 'admin' || 
                  window.location.hostname === 'localhost' || 
                  window.location.hostname.startsWith('192.168.');

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const isActive = (path) => 
    location.pathname === path 
      ? "bg-green-600 text-white shadow-lg shadow-green-900/40 scale-105" 
      : "hover:bg-gray-800 text-gray-400 hover:text-white";

  return (
    <div className="h-screen w-64 bg-gray-950 text-white flex flex-col p-4 border-r border-gray-800 shrink-0">
      {/* HEADER LOGO */}
      <div className="mb-10 mt-4 px-2">
        <h2 className="text-3xl font-black text-green-500 tracking-tighter">PUB POS</h2>
        <div className="h-1 w-12 bg-green-500 rounded-full mt-1"></div>
      </div>
      
      <nav className="flex-1 space-y-2 overflow-y-auto">
        <p className="text-[10px] font-bold text-gray-600 uppercase ml-3 mb-1">Operaciones</p>
        
        <Link to="/tables" className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${isActive("/tables")}`}>
          <LayoutDashboard size={20} /> <span className="font-medium">Mesas</span>
        </Link>

        {/* MENÚ DE ADMINISTRACIÓN (Protegido pero con bypass para local) */}
        {isAdmin && (
          <>
            <p className="text-[10px] font-bold text-gray-600 uppercase ml-3 mb-1 mt-6">Administración</p>
            
            <Link to="/estadisticas" className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${isActive("/estadisticas")}`}>
              <BarChart3 size={20} /> <span className="font-medium">Estadísticas</span>
            </Link>

            <Link to="/admin-ventas" className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${isActive("/admin-ventas")}`}>
              <ClipboardList size={20} /> <span className="font-medium">Admin Ventas</span>
            </Link>
            
            <Link to="/inventory" className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${isActive("/inventory")}`}>
              <Box size={20} /> <span className="font-medium">Inventario</span>
            </Link>

            <Link to="/compras" className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${isActive("/compras")}`}>
              <ShoppingCart size={20} /> <span className="font-medium">Compras</span>
            </Link>

            <Link to="/cierre-diario" className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${isActive("/cierre-diario")}`}>
              <ClipboardList size={20} /> <span className="font-medium">Cierre Diario</span>
            </Link>

            <Link to="/users" className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${isActive("/users")}`}>
              <Users size={20} /> <span className="font-medium">Usuarios</span>
            </Link>
          </>
        )}
      </nav>

      {/* BOTÓN CERRAR SESIÓN */}
      <div className="border-t border-gray-800 pt-4 mt-auto">
        <button 
          onClick={handleLogout} 
          className="w-full flex items-center gap-3 p-3 hover:bg-red-900/20 rounded-xl text-red-500 font-bold transition-all duration-200"
        >
          <LogOut size={20} /> Cerrar Sesión
        </button>
      </div>
    </div>
  );
}