import db from "../services/databaseService.js";
import { getLatestStateAndBroadcast } from "../services/playerStateService.js";

getLatestStateAndBroadcast();

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
      const nextPosition = maxPositionResult.max_pos + 1;
      db.prepare(
        "INSERT INTO playlist_items (song_id, position) VALUES (?, ?)"
      ).run(songId, nextPosition);
    });

    addTransaction();

    getLatestStateAndBroadcast(req.io);

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

export const removeSongFromPlaylist = (req, res) => {
  const { playlistItemId } = req.params;

  try {
    const deleteTransaction = db.transaction(() => {
      const itemToDelete = db
        .prepare("SELECT position FROM playlist_items WHERE id = ?")
        .get(playlistItemId);
      if (!itemToDelete) {
        throw new Error("PlaylistItemNotFound");
      }
      db.prepare("DELETE FROM playlist_items WHERE id = ?").run(playlistItemId);
      db.prepare(
        "UPDATE playlist_items SET position = position - 1 WHERE position > ?"
      ).run(itemToDelete.position);
    });

    deleteTransaction();
    getLatestStateAndBroadcast(req.io);
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

export const updatePlaylistOrder = (req, res) => {
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
        updateStmt.run(index + 1, id);
      });
    });
    reorderTransaction();
    getLatestStateAndBroadcast(req.io);
    res.status(200).json({ message: "Playlist reordered successfully." });
  } catch (error) {
    console.error("Error reordering playlist:", error);
    res
      .status(500)
      .json({ message: "Server error while reordering playlist." });
  }
};
