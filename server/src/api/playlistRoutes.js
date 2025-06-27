import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  addSongsToPlaylist,
  getPlaylistState,
} from "../controllers/playlistController.js";

const router = express.Router();

router.get("/", protect, getPlaylistState);

router.post("/add", protect, addSongsToPlaylist);

export default router;
