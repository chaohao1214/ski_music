import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { createServer } from "http";
import { initDb } from "./src/services/databaseService.js";
import authRoutes from "./src/api/authRoutes.js";
import playlistRoutes from "./src/api/playlistRoutes.js";
import songRoutes from "./src/api/songsRoutes.js";
import { Server } from "socket.io";
import { handleSocketConnections } from "./src/services/socketService.js";

//initialize database
initDb();

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  req.io = io;
  next();
});

//API Routes
app.use("/api/playlist", playlistRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/songs", songRoutes);

// Socket Integration
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "https://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Handle all socket logic in a separate service
handleSocketConnections(io);

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 HTTP & WebSocket server running on http://localhost:${PORT}`);
});
