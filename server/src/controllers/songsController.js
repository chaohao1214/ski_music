import { query } from "../services/postgresService.js";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { supabase } from "../services/supabaseClient.js";

dotenv.config();
const BASE_URL = process.env.BASE_URL || "http://localhost:3001";
// @desc    Get all songs from the library
// @route   GET /api/songs

export const getAllSongs = async (req, res) => {
  try {
    const result = await query("SELECT * FROM songs");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Add a new song to the library
// @route   POST /api/songs
// @access  Admin only

export const addSong = async (req, res) => {
  const { title, artist, duration, url } = req.body;

  if (!title || !duration || !url) {
    return res
      .status(400)
      .json({ message: "Please provide title, duration, and url" });
  }

  try {
    const result = await query(
      "INSERT INTO songs (title, artist, duration, url) VALUES ($1, $2, $3, $4) RETURNING id",
      [title, artist, duration, url]
    );
    res.status(201).json({ id: result.rows[0].id, ...req.body });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding song", error: error.message });
  }
};

export const addUploadedSong = async (req, res) => {
  try {
    const insertedSongs = [];

    for (const file of req.files) {
      const title = path.basename(
        file.originalname,
        path.extname(file.originalname)
      );
      // const url = `${BASE_URL}/uploads/${file.filename}`;

      const filename = file.filename;

      const result = await query(
        "INSERT INTO songs (title, filename, url, artist) VALUES ($1, $2, $3, $4) RETURNING id",
        [title, filename, filename, "Unknown"] // 只存 filename 为 url
      );

      insertedSongs.push({
        id: result.rows[0].id,
        title,
        artist: "Unknown",
        filename,
      });
    }

    res.status(201).json({ success: true, songs: insertedSongs });
  } catch (error) {
    console.error("Upload failed:", error);
    res.status(500).json({ message: "Failed to upload songs" });
  }
};

export const deleteSong = async (req, res) => {
  const { songId } = req.params;
  try {
    const result = await query("SELECT * FROM songs WHERE id = $1", [songId]);
    const song = result.rows[0];

    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    const filePath = path.join("uploads", song.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // delete supabase bucket files
    const { data, error: supabaseError } = await supabase.storage
      .from("songs")
      .remove([song.filename]);
    console.log("Supabase delete result:", { data, supabaseError });

    if (supabaseError) {
      console.error("Supabase file delete error:", supabaseError.message);
      return res
        .status(500)
        .json({ message: "Failed to delete file from storage" });
    }

    // delete songs in songs table
    await query("DELETE FROM songs WHERE id = $1", [songId]);
    res.status(200).json({ message: "Song deleted successfully" });
  } catch (error) {
    console.error("Failed to delete song:", error);
    res.status(500).json({ message: "Failed to delete song" });
  }
};
