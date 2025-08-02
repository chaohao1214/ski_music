import { SOCKET_EVENTS } from "../constans/socketEvent.js";
import { getLatestStateAndBroadcast } from "./playerStateService.js";

export const handleSocketConnections = (io) => {
  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);
    socket.join(SOCKET_EVENTS.ROOM_NAME);

    getLatestStateAndBroadcast(io);
    socket.on(SOCKET_EVENTS.COMMAND, (data) => {
      console.log("Received command from controller:", data);
      socket.to(SOCKET_EVENTS.ROOM_NAME).emit(SOCKET_EVENTS.STATE_UPDATE, data);
    });
    // Listen for state updates from a controller
    socket.on("playlist:state_change", (data) => {
      console.log("Received state change from controller:", data);
      // Broadcast the new state to all clients
      io.to(SOCKET_EVENTS.ROOM_NAME).emit(
        SOCKET_EVENTS.STATE_UPDATE,
        data.newPlaylist
      );
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};
