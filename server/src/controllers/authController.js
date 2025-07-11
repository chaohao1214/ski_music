import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../services/databaseService.js";

// @desc register user
// @route   POST /api/auth/register

export const registerUser = (req, res) => {
  const { username, password } = req.body;

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

/**
 * @desc    Authenticate a user and get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Please provide both username and password" });
  }

  try {
    const stmt = db.prepare("SELECT * FROM users WHERE username = ?");
    const user = stmt.get(username);

    if (!user) {
      console.log(`Login attempt failed: User '${username}' not found.`);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordMatch = bcrypt.compareSync(password, user.password_hash);

    if (isPasswordMatch) {
      console.log(`Login successful for user: ${user.username}`);

      // Create JWT
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "8h" }
      );

      res.json({
        id: user.id,
        username: user.username,
        role: user.role,
        token,
      });
    } else {
      console.log(
        `Login attempt failed: Incorrect password for user '${username}'.`
      );
      return res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error(
      "An unexpected error occurred during the login process:",
      error
    );
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get current logged in user's data
// @route   GET /api/auth/me
// @access  Protected

export const getMe = (req, res) => {
  const stmt = db.prepare("SELECT id, username, role FROM users WHERE id = ?");
  const user = stmt.get(req.user.id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: "User not found" });
  }
};
