import db from "../services/databaseService.js";

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
