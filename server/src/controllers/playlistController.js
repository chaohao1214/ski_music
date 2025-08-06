import {
  clearCurrentSongIfRemoved,
  getLatestStateAndBroadcast,
  setCurrentSong,
} from "../services/playerStateService.js";
import { query } from "../services/postgresService.js";
import { supabase } from "../services/supabaseClient.js";
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
      `INSERT INTO playlist_items (song_id, position)
   VALUES ($1, $2)
   RETURNING playlist_item_id AS "playlistItemId"`,
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
      .json({ ...song, playlistItemId: insertResult.rows[0].playlistItemId });
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
 * Update the playlist order in the database
 * @param {Array<string>} orderedPlaylistItemIds - Array of playlist_item_id in the desired order
 */

export const updatePlaylistOrder = async (req, res) => {
  const { playlistOrder } = req.body;

  if (!Array.isArray(playlistOrder) || playlistOrder.length === 0) {
    return res.status(400).json({ error: "Invalid playlist order array" });
  }

  try {
    // Call the Supabase SQL function
    const { error } = await supabase.rpc("update_playlist_order", {
      order_data: playlistOrder,
    });

    if (error) {
      console.error("Supabase RPC error:", error);
      return res.status(500).json({ error: error.message });
    }

    // Fetch updated playlist after reorder
    const { data: updatedPlaylist, error: fetchError } = await supabase
      .from("playlist_items")
      .select("playlistItemId:playlist_item_id, song_id, position")
      .order("position", { ascending: true });

    if (fetchError) {
      console.error("Error fetching updated playlist:", fetchError);
      return res.status(500).json({ error: fetchError.message });
    }

    getLatestStateAndBroadcast(req.io);
    res.json({
      message: "Playlist order updated successfully",
      playlist: updatedPlaylist,
    });
  } catch (error) {
    console.error("Error reordering playlist:", error);
    res
      .status(500)
      .json({ message: "Server error while reordering playlist." });
  }
};
