import { getLatestStateAndBroadcast } from "./playerStateService.js";

export const handleSocketConnections = (io) => {
  const roomName = "music-control-room";
  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);
    socket.join(roomName);

    getLatestStateAndBroadcast(io);
    socket.on("player:command", (data) => {
      console.log("Received command from controller:", data);
      socket.to(roomName).emit("player:execute", data);
    });
    // Listen for state updates from a controller
    socket.on("playlist:state_change", (data) => {
      console.log("Received state change from controller:", data);
      // Broadcast the new state to all clients
      io.to(roomName).emit("playlist:update", data.newPlaylist);
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};
