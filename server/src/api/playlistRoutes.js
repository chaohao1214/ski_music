import express from "express";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, (req, res) => {
  console.log("Authenticated user:", req.user);
  res.json({ message: "Welcome to the protected playlist!", user: req.user });
});

export default router;
