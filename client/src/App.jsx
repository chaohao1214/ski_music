import { Route, Routes, BrowserRouter } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import { useDispatch, useSelector } from "react-redux";
import { setAuthToken } from "./utils/apiClient";
import { useEffect } from "react";
import { getMe, openLoginModal } from "./features/auth/authSlice";
import LoginModal from "./components/LoginModal";

const HomePage = () => {
  const dispatch = useDispatch();
  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h1>Welcome to the Music App</h1>
      <p>This is the public home page.</p>
      <button onClick={() => dispatch(openLoginModal())}>Open Login</button>
    </div>
  );
};
const token = localStorage.getItem("token");
if (token) {
  setAuthToken(token);
}

function App() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(getMe());
    }
  }, [token]);
  return (
    <BrowserRouter>
      <LoginModal />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
