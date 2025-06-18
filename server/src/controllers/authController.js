import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../services/databaseService.js";

// @desc register user
// @route   POST /api/auth/register

export const registerUser = (req, res) => {
  // --- DEBUG ---
  console.log("1. Received request for /api/auth/register");
  const { username, password } = req.body;
  console.log("2. Request body:", req.body);
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Please provide username and password" });
  }
  const salt = bcrypt.genSaltSync(10);
  const password_hash = bcrypt.hashSync(password, salt);

  try {
    const stmt = db.prepare(
      "INSERT INTO users (username, password_hash) VALUES (?, ?)"
    );
    const info = stmt.run(username, password_hash);
    res.status(201).json({ id: info.lastInsertRowid, username });
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ message: "Username already exists" });
    }
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// @desc    login
// @route   POST /api/auth/login
export const loginUser = (req, res) => {
  const { username, password } = req.body;

  const stmt = db.prepare("SELECT * FROM users WHERE username = ?");
  const user = stmt.get(username);

  if (user && bcrypt.compare(password, user.password_hash)) {
    //generate jwt
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h", // valid for an hour
    });
    res.json({ id: user.id, username: user.username, token });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
};
