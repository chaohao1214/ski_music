import db from "../services/databaseService.js";
import path from "path";
import fs from "fs";
// @desc    Get all songs from the library
// @route   GET /api/songs

export const getAllSongs = (req, res) => {
  try {
    const stmt = db.prepare("SELECT * FROM songs");
    const songs = stmt.all();
    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Add a new song to the library
// @route   POST /api/songs
// @access  Admin only

export const addSong = (req, res) => {
  // In a real app, you would handle file uploads to Cloudflare R2 here.
  // For now, we assume the URL is provided directly.
  const { title, artist, duration, url } = req.body;
  if (!title || !duration || !url) {
    return res
      .status(400)
      .json({ message: "Please provide title, duration, and url" });
  }
  try {
    const stmt = db.prepare(
      "INSERT INTO songs (title, artist, duration, url) VALUES (?, ?, ?, ?)"
    );
    const info = stmt.run(title, artist, duration, url);
    res.status(201).json({ id: info.lastInsertRowid, ...req.body });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding song", error: error.message });
  }
};

export const addUploadedSong = (req, res) => {
  try {
    const insertedSongs = [];
    req.files.forEach((file) => {
      const title = path.basename(
        file.originalname,
        path.extname(file.originalname)
      );
      const url = `http://localhost:3001/uploads/${file.filename}`;

      const result = db
        .prepare("INSERT INTO songs (title, filename, url) VALUES (?,?,?)")
        .run(title, file.filename, url);

      insertedSongs.push({
        id: result.lastInsertRowid,
        title,
        artist: "Unknown",
        url,
      });
    });
    res.status(201).json({ songs: insertedSongs });
  } catch (error) {
    console.error("Upload failed:", error);
    res.status(500).json({ message: " Failed to upload songs" });
  }
};

export const deleteSong = (req, res) => {
  const { songId } = req.params;
  console.log("🚨 DELETE /api/songs/:songId", req.params.songId);
  try {
    const song = db.prepare("SELECT * FROM songs WHERE id = ?").get(songId);
    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    //delete file
    const filePath = path.join("uploads", song.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    db.prepare("DELETE FROM songs WHERE id=?").run(songId);
    res.status(200).json({ message: "Song deleted successfully" });
  } catch (error) {
    console.error("Failed to delete song:", error);
    res.status(500).json({ message: "Failed to delete song" });
  }
};
