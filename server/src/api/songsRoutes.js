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

router.post("/upload", protect, localUploadMiddleware, admin, addUploadedSong);
router.post(
  "/upload-supabase",
  protect,
  uploadMiddleware,
  admin,
  uploadSongToSupabase
);
router.delete("/:songId", deleteSong);

export default router;
