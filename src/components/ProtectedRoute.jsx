import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, roles }) {

  const user = JSON.parse(localStorage.getItem("user"));

  console.log("USER EN PROTECTED:", user);
  console.log("ROLES PERMITIDOS:", roles);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🔥 NORMALIZAR ROLE
  const userRole = user.role?.trim().toLowerCase();

  if (roles && !roles.map(r => r.toLowerCase()).includes(userRole)) {
    console.log("⛔ ACCESO DENEGADO");
    return <Navigate to="/" replace />;
  }

  return children;
}