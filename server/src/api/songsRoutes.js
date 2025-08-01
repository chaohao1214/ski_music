import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import {
  addSong,
  addUploadedSong,
  deleteSong,
  getAllSongs,
} from "../controllers/songsController.js";
import { admin } from "../middleware/adminMiddleware.js";
import {
  uploadMiddleware,
  uploadSongToSupabase,
} from "../controllers/uploadController.js";
const router = express.Router();

router.get("/", protect, getAllSongs);

//only admins can add new songs
router.post("/", protect, admin, addSong);

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({ storage });
router.post("/upload", upload.array("songs", 10), addUploadedSong);
router.post(
  "/upload-supabase",
  protect,
  uploadMiddleware,
  uploadSongToSupabase
);
router.delete("/:songId", deleteSong);

export default router;
