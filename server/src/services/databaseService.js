import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
const db = new Database("skating_rink.db", { verbose: console.log });

function ensureAdminExists() {
  const stmt = db.prepare(
    "SELECT id FROM users WHERE username= ? AND role = ?"
  );
  const admin = stmt.get("admin", "admin");
  if (!admin) {
    // Lazy-load bcrypt only when it's actually needed for the setup

    console.log("Admin user not found, creating one...");
    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync("admin123", salt);

    const insertStmt = db.prepare(
      "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)"
    );
    insertStmt.run("admin", password_hash, "admin");
    console.log(
      'Admin user created with default password "admin123". Please change it.'
    );
  }
}

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      -- FIX: Added role column with a default and check constraint
      role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'admin'))
    );
    
    CREATE TABLE IF NOT EXISTS playlist_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  song_id INTEGER NOT NULL, -- This will be a foreign key to the 'songs' table
  position INTEGER NOT NULL, -- To maintain the order of songs
  FOREIGN KEY (song_id) REFERENCES songs (id)
);

    -- NEW: Create the master songs library table
    CREATE TABLE IF NOT EXISTS songs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      artist TEXT,
      duration INTEGER NOT NULL,
      url TEXT NOT NULL UNIQUE
    );
  `);
  ensureAdminExists();
}

export default db;
