import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  addUploadedSong,
  deleteSong,
  getAllSongs,
} from "../controllers/songsController.js";
import { admin } from "../middleware/adminMiddleware.js";
import {
  uploadMiddleware,
  uploadSongToSupabase,
} from "../controllers/uploadController.js";
import { localUploadMiddleware } from "../middleware/fileUploadConfig.js";
const router = express.Router();

router.get("/", protect, getAllSongs);

//only admins can add new songs

router.post("/upload", protect, admin, localUploadMiddleware, addUploadedSong);
router.post(
  "/upload-supabase",
  protect,
  admin,
  uploadMiddleware,
  uploadSongToSupabase
);

// only admin can delete the song
router.delete("/:songId", protect, admin, deleteSong);

export default router;
