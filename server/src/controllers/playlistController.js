import db from "../services/databaseService.js";

let currentPlaylist = [];
let playerState = {
  currentSongIndex: -1, // -1 means nothing is selected
  status: "stopped", // 'playing', 'paused', 'stopped'
};

// A helper function we will call later to broadcast updates via MQTT
const broadcastState = () => {
  const fullState = {
    playlist: currentPlaylist,
    playerState: playerState,
  };
  console.log("Broadcasting new state:", fullState);
  // TODO: Add MQTT publish logic here
  // mqttClient.publish('skating/player/state', JSON.stringify(fullState));
};

/**
 * @desc    Get the current playlist and player state from the database
 * @route   GET /api/playlist
 * @access  Protected
 */

export const getPlaylistState = (req, res) => {
  try {
    const sql = `SELECT
        s.id,
        s.title,
        s.artist,
        s.duration,
        s.url,
        pi.position,
        pi.id as playlistItemId
      FROM
        playlist_items AS pi
      JOIN
        songs AS s ON pi.song_id = s.id
      ORDER BY
        pi.position ASC;`;
    const playlist = db.prepare(sql).all();

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

      // Insert the new song at the end of the playlist
      const stmt = db.prepare(
        "INSERT INTO playlist_items (song_id, position) VALUES (?, ?)"
      );
      stmt.run(songId, nextPosition);
    });

    addTransaction();

    const updatedPlaylist = db
      .prepare(
        `SELECT s.id, s.title, s.artist, s.duration, s.url, pi.position FROM playlist_items AS pi JOIN songs AS s ON pi.song_id = s.id ORDER BY pi.position ASC;`
      )
      .all();
    broadcastState(updatedPlaylist);
    res.status(201).json(song);
  } catch (error) {
    console.error("Error adding song to playlist:", error);
    res.status(500).json({ message: "Error adding song to playlist" });
  }
};
