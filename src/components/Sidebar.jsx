import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  ClipboardList,
  CreditCard,
  BarChart3,
  Settings,
  Menu,
} from "lucide-react";

// 🔐 Decodificar token
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(true);

  const location = useLocation();

  // 🔐 usuario y rol
  const token = localStorage.getItem("token");
  const user = token ? parseJwt(token) : null;
  const role = user?.role?.toLowerCase();

  // guardar estado sidebar
  useEffect(() => {
    localStorage.setItem("sidebar", collapsed ? "collapsed" : "expanded");
  }, [collapsed]);

  // tema oscuro
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  // 📌 SECCIONES
  const sections = [
    {
      title: "Ventas",
      items: [
        { name: "Mesas", path: "/tables", icon: <LayoutGrid size={20} /> },
        { name: "Órdenes", path: "/order", icon: <ClipboardList size={20} /> },
        { name: "Pagos", path: "/payment", icon: <CreditCard size={20} /> },
      ],
    },
    {
      title: "Reportes",
      items: [
        { name: "Ventas", path: "/reports", icon: <BarChart3 size={20} /> },
      ],
    },
    {
      title: "Admin",
      items: [
        { name: "Productos", path: "/products", icon: <ClipboardList size={20} /> },
        { name: "Usuarios", path: "/users", icon: <LayoutGrid size={20} /> },
        { name: "Compras", path: "/purchases", icon: <CreditCard size={20} /> },
        { name: "IVA", path: "/tax", icon: <BarChart3 size={20} /> },
        { name: "Configuración", path: "/settings", icon: <Settings size={20} /> },
        { name: "Historial Compras", path: "/purchases/history", icon: <BarChart3 size={20} /> },
      ],
    },
  ];

  // 🔐 FILTRO POR ROL
  const filteredSections = sections.map((section) => {
    if (role !== "admin") {
      if (section.title === "Admin" || section.title === "Reportes") {
        return { ...section, items: [] };
      }
    }
    return section;
  });

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div
      className={`h-screen flex flex-col p-4 transition-all duration-300
      ${collapsed ? "w-20" : "w-64"}
      bg-white text-slate-900 dark:bg-slate-900 dark:text-white`}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        {!collapsed && (
          <h2 className="text-xl font-bold flex items-center gap-2">
            🍺 Pub POS
          </h2>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-slate-800"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* SECCIONES */}
      <div className="space-y-6">
        {filteredSections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="text-xs uppercase text-slate-400 mb-2 px-2">
                {section.title}
              </p>
            )}

            <ul className="space-y-2">
              {section.items.map((item) => (
                <li key={item.path} className="relative group">
                  <NavLink
                    to={item.path}
                    end
                    className={({ isActive }) =>
                      `
                      flex items-center gap-3 p-3 rounded-lg transition-all
                      ${
                        isActive
                          ? "bg-slate-300 dark:bg-slate-700"
                          : "hover:bg-slate-200 dark:hover:bg-slate-800"
                      }
                      ${collapsed ? "justify-center" : ""}
                    `
                    }
                  >
                    {item.icon}
                    {!collapsed && <span>{item.name}</span>}
                  </NavLink>

                  {/* TOOLTIP */}
                  {collapsed && (
                    <span
                      className="absolute left-16 top-1/2 -translate-y-1/2
                      bg-slate-800 text-white text-xs px-2 py-1 rounded
                      opacity-0 group-hover:opacity-100 transition whitespace-nowrap"
                    >
                      {item.name}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className="mt-auto pt-6 space-y-2">

        {/* 🌗 TEMA */}
        <button
          onClick={() => setDark(!dark)}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-lg 
          bg-slate-800 hover:bg-slate-700 transition"
        >
          {dark ? "☀️" : "🌙"}
          {!collapsed && (dark ? "Modo Claro" : "Modo Oscuro")}
        </button>

        {/* 🚪 LOGOUT */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-lg 
          bg-red-600 hover:bg-red-700 transition"
        >
          🚪 {!collapsed && "Cerrar sesión"}
        </button>

      </div>
    </div>
  );
};

export default Sidebar;