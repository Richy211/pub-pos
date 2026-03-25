import { Navigate } from "react-router-dom";

// 🔐 decodificar token
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

const ProtectedRoute = ({ children, roles }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  const user = parseJwt(token);
  const role = user?.role?.toLowerCase();

  // 🔐 validar rol
  if (roles && !roles.includes(role)) {
    return <Navigate to="/tables" />;
  }

  return children;
};

export default ProtectedRoute;