import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { createServer } from "http";
import authRoutes from "./src/api/authRoutes.js";
import playlistRoutes from "./src/api/playlistRoutes.js";
import playerRoutes from "./src/api/playerRoutes.js";
import songRoutes from "./src/api/songsRoutes.js";
import { Server } from "socket.io";
import { handleSocketConnections } from "./src/services/socketService.js";
import { initPlayerStateService } from "./src/services/playerStateService.js";
import { query } from "./src/services/postgresService.js";

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  req.io = io;
  next();
});

console.log("Loaded 11DATABASE_URL:", process.env.DATABASE_URL);

//API Routes
app.use("/api/playlist", playlistRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/player", playerRoutes);
app.use("/uploads", express.static("uploads"));

// Socket Integration
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Handle all socket logic in a separate service
handleSocketConnections(io);
initPlayerStateService(io);

// Ensure player_state row exists
async function ensurePlayerStateExists() {
  const result = await query("SELECT COUNT(*) FROM player_state");
  if (parseInt(result.rows[0].count) === 0) {
    await query(
      "INSERT INTO player_state (status, current_song_id) VALUES ($1, $2)",
      ["stopped", null]
    );
    console.log("✅ Initialized player_state row.");
  }
}

ensurePlayerStateExists();
const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 HTTP & WebSocket server running on http://localhost:${PORT}`);
});
