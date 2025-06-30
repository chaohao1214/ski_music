import { Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { openLoginModal } from "../features/auth/authSlice";
const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, status } = useSelector((state) => state.auth);
  const location = useLocation();

  useEffect(() => {
    if (status !== "loading" && !isAuthenticated) {
      dispatch(openLoginModal());
    }
  }, [isAuthenticated, status]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }
  return isAuthenticated ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
