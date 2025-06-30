import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import http from "http";
import { initDb } from "./src/services/databaseService.js";
import authRoutes from "./src/api/authRoutes.js";
import playlistRoutes from "./src/api/playlistRoutes.js";
import songRoutes from "./src/api/songsRoutes.js";
import { setupWebSocket } from "./src/services/websocketService.js";

//initialize database
initDb();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

app.use("/api/playlist", playlistRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/songs", songRoutes);

const PORT = process.env.PORT || 3001;

const server = http.createServer(app);
setupWebSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 HTTP & WebSocket server running on http://localhost:${PORT}`);
});
