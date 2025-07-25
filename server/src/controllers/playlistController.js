import {
  clearCurrentSongIfRemoved,
  getLatestStateAndBroadcast,
  setCurrentSong,
} from "../services/playerStateService.js";
import { query } from "../services/postgresService.js";
/**
 * @desc    Add a song to the current playlist
 * @route   POST /api/playlist/add
 * @access  Protected
 */

export const addSongsToPlaylist = async (req, res) => {
  const { songId } = req.body;

  if (!songId) {
    return res.status(400).json({ message: "Song ID is required." });
  }

  try {
    const songResult = await query("SELECT * FROM songs WHERE id = $1", [
      songId,
    ]);
    const song = songResult.rows[0];

    if (!song) {
      return res.status(404).json({ message: "Song not found in library" });
    }

    // Get the current max position in the playlist
    const maxPosResult = await query(
      "SELECT COALESCE(MAX(position), 0) as max_pos FROM playlist_items"
    );
    const nextPosition = maxPosResult.rows[0].max_pos + 1;

    // Insert the new song into playlist_items
    const insertResult = await query(
      "INSERT INTO playlist_items (song_id, position) VALUES ($1, $2) RETURNING playlist_item_id",
      [songId, nextPosition]
    );

    // const existing = await query(
    //   "SELECT * FROM playlist_items WHERE song_id = $1",
    //   [songId]
    // );
    // if (existing.rows.length > 0) {
    //   return res.status(409).json({ message: "Song already in playlist" });
    // }
    // If it's the first song, set it as current
    if (nextPosition === 1) {
      await setCurrentSong(songId);
    }

    getLatestStateAndBroadcast(req.io);
    res
      .status(201)
      .json({ ...song, playlistItemId: insertResult.rows[0].playlist_item_id });
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

export const removeSongFromPlaylist = async (req, res) => {
  const { playlistItemId } = req.params;

  try {
    const result = await query(
      "SELECT * FROM playlist_items WHERE playlist_item_id = $1",
      [playlistItemId]
    );
    const item = result.rows[0];

    if (!item) {
      return res.status(404).json({ message: "Playlist item not found." });
    }

    await query("DELETE FROM playlist_items WHERE playlist_item_id = $1", [
      playlistItemId,
    ]);
    clearCurrentSongIfRemoved(item.song_id);

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

export const updatePlaylistOrder = async (req, res) => {
  const { orderedIds } = req.body;

  if (!Array.isArray(orderedIds)) {
    return res
      .status(400)
      .json({ message: "Request body must contain an array of 'orderedIds'." });
  }

  try {
    // Use a transaction to ensure consistent update
    await query("BEGIN");

    for (let i = 0; i < orderedIds.length; i++) {
      await query("UPDATE playlist_items SET position = $1 WHERE id = $2", [
        i + 1,
        orderedIds[i],
      ]);
    }

    await query("COMMIT");
    getLatestStateAndBroadcast(req.io);
    res.status(200).json({ message: "Playlist reordered successfully." });
  } catch (error) {
    await query("ROLLBACK");
    console.error("Error reordering playlist:", error);
    res
      .status(500)
      .json({ message: "Server error while reordering playlist." });
  }
};
