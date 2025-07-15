import express from "express";

import {
  getPlayerState,
  handlePlayerAction,
} from "../controllers/playerController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/action", protect, handlePlayerAction);

router.get("/state", getPlayerState);

export default router;
