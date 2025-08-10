import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function RequireAdmin({ children }) {
  const user = useSelector((s) => s.auth.user);
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}
