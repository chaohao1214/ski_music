import db from "../services/databaseService.js";
import { broadcast } from "../services/websocketService.js";

let playerState = {
  currentSongIndex: -1, // -1 means nothing is selected
  status: "stopped", // 'playing', 'paused', 'stopped'
};

/**
 * A helper function to get the latest full state from the DB and broadcast it.
 * This ensures all clients receive the most up-to-date information.
 * @param {function} broadcast - The WebSocket broadcast function.
 */

const getLatestStateAndBroadcast = (broadcast) => {
  try {
    const playlistQuery = `
      SELECT
        s.id, s.title, s.artist, s.duration, s.url,
        pi.position, pi.id as playlistItemId
      FROM playlist_items AS pi
      JOIN songs AS s ON pi.song_id = s.id
      ORDER BY pi.position ASC;
    `;
    const playlist = db.prepare(playlistQuery).all();
    const fullState = {
      playlist: playlist,
      player: playerState,
    };

    broadcast({
      type: "STATE_UPDATE",
      payload: fullState,
    });
    zz;
  } catch (error) {
    console.error("Error fetching latest state for broadcast:", error);
  }
};

// --- Controller Functions ---

/**
 * @desc    Get the current playlist and player state
 * @route   GET /api/playlist
 * @access  Protected
 */

export const getPlaylistState = (req, res) => {
  try {
    const playlistQuery = `
      SELECT
        s.id, s.title, s.artist, s.duration, s.url,
        pi.position, pi.id as playlistItemId
      FROM playlist_items AS pi
      JOIN songs AS s ON pi.song_id = s.id
      ORDER BY pi.position ASC;
    `;
    const playlist = db.prepare(playlistQuery).all();

    res.json({ playlist: playlist, player: playerState });
  } catch (error) {
    console.error("Error fetching playlist state:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Add a song to the current playlist
 * @route   POST /api/playlist/add
 * @access  Protected
 */

export const addSongsToPlaylist = (req, res) => {
  const { songId } = req.body;

  if (!songId) {
    return res.status(400).json({ message: "Song ID is required." });
  }

  try {
    const song = db.prepare("SELECT * FROM songs WHERE id = ?").get(songId);
    if (!song) {
      return res.status(404).json({ message: "Song not found in library" });
    }
    // Use a transaction to safely get the next position and insert the new song
    const addTransaction = db.transaction(() => {
      const maxPositionResult = db
        .prepare(
          "SELECT COALESCE(MAX(position), 0) as max_pos FROM playlist_items"
        )
        .get();
      const nextPosition = maxPosResult.max_pos + 1;
      db.prepare(
        "INSERT INTO playlist_items (song_id, position) VALUES (?, ?)"
      ).run(songId, nextPosition);
    });

    addTransaction();

    getLatestStateAndBroadcast(broadcast);

    res.status(201).json(song);
  } catch (error) {
    console.error("Error adding song to playlist:", error);
    res.status(500).json({ message: "Error adding song to playlist" });
  }
};

/**
 * @desc    Remove a song from the playlist
 * @route   DELETE /api/playlist/remove/:playlistItemId
 * @access  Protected
 */

export const removeSongFromPlaylist = (broadcast) => {
  const { playlistItemId } = req.params;

  try {
    const result = db
      .prepare("DELETE FROM playlist_items WHERE id = ?")
      .run(playlistItemId);
    if (result.changes === 0) {
      return res.status(404).json({ message: "Playlist item not found." });
    }
    getLatestStateAndBroadcast(broadcast);
    res.status(200).json({ message: "Song removed from playlist." });
  } catch (error) {
    console.error("Error removing song from playlist:", error);
    res.status(500).json({ message: "Server error while removing song." });
  }
};

/**
 * @desc    Update the order of songs in the playlist
 * @route   PUT /api/playlist/reorder
 * @access  Protected
 */

export const updatePlaylistOrder = (broadcast) => (req, res) => {
  const { orderedIds } = req.body;

  if (!Array.isArray(orderedIds)) {
    return res
      .status(400)
      .json({ message: "Request body must contain an array of 'orderedIds'." });
  }

  try {
    const reorderTransaction = db.transaction(() => {
      const updateStmt = db.prepare(
        "UPDATE playlist_items SET position = ? WHERE id = ?"
      );
      orderedIds.forEach((id, index) => {
        // The new position is the index in the array (e.g., 0, 1, 2...)
        updateStmt.run(index, id);
      });
    });
    reorderTransaction();
    getLatestStateAndBroadcast();
    res.status(200).json({ message: "Playlist reordered successfully." });
  } catch (error) {
    console.error("Error reordering playlist:", error);
    res
      .status(500)
      .json({ message: "Server error while reordering playlist." });
  }
};
