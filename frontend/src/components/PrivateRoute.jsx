import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

/**
 * PrivateRoute - Bảo vệ các route cần đăng nhập
 * @param children - Component con
 * @param requiredRole - Vai trò bắt buộc (vd: 'ADMIN'). Nếu null thì chỉ cần đăng nhập.
 */
export default function PrivateRoute({ children, requiredRole = null }) {
  const [authorized, setAuthorized] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      setAuthorized(false);
      return;
    }

    try {
      const user = JSON.parse(userStr);

      // Kiểm tra role nếu có yêu cầu
      if (requiredRole && user.role !== requiredRole) {
        setAuthorized(false);
        return;
      }

      setAuthorized(true);
    } catch {
      setAuthorized(false);
    }
  }, [requiredRole]);

  if (authorized === null) return <p>Đang kiểm tra đăng nhập...</p>;
  if (!authorized) return <Navigate to="/login" replace />;
  return children;
}