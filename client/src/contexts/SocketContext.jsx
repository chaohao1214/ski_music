import { useContext } from "react";
import { createContext } from "react";
import { io } from "socket.io-client";
const VITE_API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

const socket = io(VITE_API_URL, {
  // reconnection: true,
  // reconnectionAttempts: 5,
  autoConnect: false,
});

const SocketContext = createContext(socket);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });
  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  socket.on("connect_error", (err) => {
    console.error("Socket.IO connection error:", err.message);
  });
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
