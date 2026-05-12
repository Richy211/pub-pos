// ... (mismos imports de lucide-react y react-router-dom)

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const token = localStorage.getItem("token");
  let user = null;

  try {
    // Si hay token, intentamos parsear. Si falla, al menos no rompe el componente.
    if (token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      user = JSON.parse(window.atob(base64));
    }
  } catch (e) {
    console.error("Token no válido o inexistente");
  }
  
  // PARCHE PROVISIONAL: Si estás en localhost, isAdmin será true siempre para que puedas trabajar
  // En producción (Netlify), dependerá del token real.
  const isAdmin = user?.role === 'admin' || window.location.hostname === 'localhost';

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
      {/* ... (Logo PUB POS) */}
      
      <nav className="flex-1 space-y-2 overflow-y-auto">
        <p className="text-[10px] font-bold text-gray-600 uppercase ml-3 mb-1">Operaciones</p>
        
        <Link to="/tables" className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${isActive("/tables")}`}>
          <LayoutDashboard size={20} /> <span className="font-medium">Mesas</span>
        </Link>

        {/* Si isAdmin es true, mostramos el resto */}
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

            {/* Agregué el isActive a los que faltaban para que se vean verdes al pinchar */}
            <Link to="/cierre-diario" className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${isActive("/cierre-diario")}`}>
              <ClipboardList size={20} /> <span className="font-medium">Cierre Diario</span>
            </Link>

            <Link to="/cierre-fiscal" className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${isActive("/cierre-fiscal")}`}>
              <span className="ml-1">⚖️</span> <span className="font-medium ml-2">Cierre Fiscal</span>
            </Link>

            <Link to="/arqueo" className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${isActive("/arqueo")}`}>
              <span className="ml-1">💰</span> <span className="font-medium ml-2">Arqueo de Caja</span>
            </Link>

            <Link to="/users" className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${isActive("/users")}`}>
              <Users size={20} /> <span className="font-medium">Usuarios</span>
            </Link>
          </>
        )}
      </nav>
      {/* ... (Logout) */}
    </div>
  );
}