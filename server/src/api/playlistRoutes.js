import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  addSongsToPlaylist,
  removeSongFromPlaylist,
  updatePlaylistOrder,
} from "../controllers/playlistController.js";

const router = express.Router();

router.use(protect);
router.post("/add", addSongsToPlaylist);
router.delete("/remove/:playlistItemId", removeSongFromPlaylist);
router.put("/reorder", updatePlaylistOrder);

export default router;
