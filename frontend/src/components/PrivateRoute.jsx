import { useMemo } from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children, requiredRole = null }) {
  const authorized = useMemo(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      return false;
    }

    try {
      const user = JSON.parse(userStr);
      return requiredRole ? user.role === requiredRole : true;
    } catch {
      return false;
    }
  }, [requiredRole]);

  if (!authorized) return <Navigate to="/login" replace />;
  return children;
}
