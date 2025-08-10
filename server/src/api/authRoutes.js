import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  getAllUsers,
  updateUserRole,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.get("/", protect, admin, getAllUsers);
router.patch("/:id/role", protect, admin, updateUserRole);

export default router;
