import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const [authorized, setAuthorized] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setAuthorized(!!token);
  }, []);

  if (authorized === null) return <p>Đang kiểm tra đăng nhập...</p>; // hoặc spinner
  if (!authorized) return <Navigate to="/login" replace />;
  return children;
}
