import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { initDb } from "./src/services/databaseService.js";
import authRoutes from "./src/api/authRoutes.js";
import playlistRoutes from "./src/api/playlistRoutes.js";

//initialize database
initDb();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

app.use("/api/playlist", playlistRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server with ES Modules running on http://localhost:${PORT}`);
});
