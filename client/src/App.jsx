import { Route, Routes, BrowserRouter } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAuthToken } from "./utils/apiClient";
import { useEffect } from "react";
import { getMe } from "./features/auth/authSlice";
import LoginModal from "./components/LoginModal";
import HomePage from "./pages/HomePage";
import { useSocket } from "./contexts/SocketContext";
import PlayerPage from "./pages/PlayerPage";
import { setPlayerState } from "./features/music/playerSlice";
import ControlInterface from "./pages/ControlInterfacePage";

const token = localStorage.getItem("token");
if (token) {
  setAuthToken(token);
}

function App() {
  const dispatch = useDispatch();
  const socket = useSocket();
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(getMe());
    }
  }, [token]);

  useEffect(() => {
    const handlePlaylistUpdate = (newState) => {
      console.log("Received playlist:update event with new state:", newState);
      dispatch(setPlayerState(newState));
    };

    socket.on("playlist:update", handlePlaylistUpdate);

    return () => {
      socket.off("playlist:update", handlePlaylistUpdate);
    };
  }, [socket, dispatch]);
  return (
    <BrowserRouter>
      <LoginModal />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/player" element={<PlayerPage />} />
        <Route path="/remote" element={<ControlInterface />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
