import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../services/postgresService.js";

export const ensureAdminExists = async () => {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  const check = await query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);
  if (check.rows.length === 0) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await query(
      "INSERT INTO users (username, password, role) VALUES ($1, $2, $3)",
      [username, hashedPassword, "admin"]
    );
    console.log("✅ Admin user created:", username);
  } else {
    console.log("✅ Admin user already exists.");
  }
};

// @desc register user
// @route   POST /api/auth/register

export const registerUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Please provide username and password" });
  }

  const salt = bcrypt.genSaltSync(10);
  const password_hash = bcrypt.hashSync(password, salt);

  try {
    const role = "general_user";
    const result = await query(
      "INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id",
      [username, password_hash, role]
    );
    res.status(201).json({ id: result.rows[0].id, username, role });
  } catch (error) {
    if (error.code === "23505") {
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
export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Please provide both username and password" });
  }

  try {
    const result = await query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    const user = result.rows[0];

    if (!user) {
      console.log(`Login failed: User '${username}' not found.`);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordMatch = bcrypt.compareSync(password, user.password);

    if (isPasswordMatch) {
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
      console.log(`Login failed: Wrong password for '${username}'.`);
      return res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get current logged in user's data
// @route   GET /api/auth/me
// @access  Protected

export const getMe = async (req, res) => {
  try {
    const result = await query(
      "SELECT id, username, role FROM users WHERE id = $1",
      [req.user.id]
    );
    const user = result.rows[0];

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const result = await query(
      "SELECT id, username, role FROM users ORDER BY username ASC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateUserRoleBulk = async (req, res) => {
  const { changes } = req.body;
  if (!Array.isArray(changes) || changes.length === 0) {
    return res
      .status(400)
      .json({ message: "Changes must be a non-empty array" });
  }

  const allowedRoles = new Set([
    "general_user",
    "super_user",
    "player",
    "admin",
  ]);

  for (const changeItem of changes) {
    if (
      !changeItem?.id ||
      !changeItem?.role ||
      !allowedRoles.has(changeItem.role)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid payload in changes array" });
    }
  }

  try {
    const ids = changes.map((changeItem) => changeItem.id);
    const currentResult = await query(
      "SELECT id, role FROM users WHERE id = ANY($1::uuid[])",
      [ids]
    );
    const currentById = new Map(
      currentResult.rows.map((row) => [row.id, row.role])
    );

    // 2. protected the last admin
    const adminsCountResult = await query(
      "SELECT COUNT(*)::int AS cnt FROM users WHERE role = 'admin'"
    );
    const currentAdminCount = adminsCountResult.rows[0]?.cnt || 0;

    let demotionsFromAdmin = 0;
    let promotionsToAdmin = 0;

    for (const changeItem of changes) {
      const currentRole = currentById.get(changeItem.id);
      if (!currentRole) {
        return res
          .status(404)
          .json({ message: `User not found: ${changeItem.id}` });
      }
      if (currentRole === "admin" && changeItem.role !== "admin") {
        demotionsFromAdmin += 1;
      }
      if (currentRole !== "admin" && changeItem.role === "admin") {
        promotionsToAdmin += 1;
      }
    }
    const finalAdminCount =
      currentAdminCount - demotionsFromAdmin + promotionsToAdmin;
    if (finalAdminCount < 1) {
      return res.status(409).json({ message: "Cannot demote the last admin" });
    }
    await query("BEGIN");
    const sql = `
      WITH input AS (
        SELECT *
        FROM json_to_recordset($1::json)
        AS t(id uuid, role text)
      )
      UPDATE users AS u
      SET role = input.role
      FROM input
      WHERE u.id = input.id
      RETURNING u.id, u.username, u.role
    `;

    const updateResult = await query(sql, [JSON.stringify(changes)]);
    await query("COMMIT");

    return res.json({
      updatedCount: updateResult.rowCount,
      users: updateResult.rows, // [{ id, username, role }]
    });
  } catch (error) {
    await query("ROLLBACK");
    console.error("Bulk role update error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
