import express from "express";

import { handlePlayerAction } from "../controllers/playerController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/action", protect, handlePlayerAction);

export default router;
