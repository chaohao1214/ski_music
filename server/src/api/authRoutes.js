import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  getAllUsers,
  updateUserRoleBulk,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.get("/", protect, admin, getAllUsers);
router.patch("/roles-batch", protect, admin, updateUserRoleBulk);

export default router;
