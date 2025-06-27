import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { addSong, getAllSongs } from "../controllers/songsController.js";
import { admin } from "../middleware/adminMiddleware.js";
const router = express.Router();

router.get("/", protect, getAllSongs);

//only admins can add new songs
router.post("/", protect, admin, addSong);

export default router;
