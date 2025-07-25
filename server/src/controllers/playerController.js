import {
  getCurrentPlaylist,
  getLatestStateAndBroadcast,
  setCurrentSong,
  setPlayerStatus,
  getCurrentSongId,
} from "../services/playerStateService.js";
import { query } from "../services/postgresService.js";

export const getPlayerStateFromDB = async () => {
  const result = await query("SELECT * FROM player_state LIMIT 1");
  return result.rows[0];
};

/**
 * @desc    Handle player actions like play and pause
 * @route   POST /api/player/action
 */
export const handlePlayerAction = (req, res) => {
  const { action, songId } = req.body;

  if (!action) {
    return res.status(400).json({ message: "Action is required" });
  }

  switch (action.toLowerCase()) {
    case "play":
      let selectedSongId = songId;
      if (!selectedSongId) {
        const playlist = getCurrentPlaylist();
        if (playlist.length === 0) {
          return res
            .status(400)
            .json({ message: "Playlist is empty. Cannot play." });
        }
        selectedSongId = playlist[0].id;
      }
      setPlayerStatus("playing");
      setCurrentSong(selectedSongId);

      req.io.to("music-control-room").emit("player:execute", {
        action: "PLAY",
        songId: selectedSongId,
      });
      getLatestStateAndBroadcast(req.io);
      break;
    case "pause":
      setPlayerStatus("paused");
      break;
    case "next": {
      const { playlist } = getLatestState();
      const currentSongId = getCurrentSongId();
      const currentIndex = playlist.findIndex(
        (item) => item.id === currentSongId
      );
      const nextIndex = (currentIndex + 1) % playlist.length;
      if (playlist.length === 0 || currentIndex === -1) {
        return res.status(400).json({ message: "No valid song to play next" });
      }
      const nextSong = playlist(nextIndex);
      if (nextSong) {
        setCurrentSong(nextSong.id);
        setPlayerStatus("playing");

        req.io
          .to("music-control-room")
          .emit("player:execute", { action: "PLAY", songId: nextSong.id });
      }
      break;
    }
    case "stop":
      setCurrentSong(null);
      setPlayerStatus("stopped");
      break;
    default:
      return res.status(400).json({ message: `Unknown action: ${action}` });
  }
  getLatestStateAndBroadcast(req.io);
  res.status(200).json({ message: `Player state updated to ${action}` });
};

export const getPlayerState = async (req, res) => {
  try {
    // 播放队列
    const playlistResult = await query(`
      SELECT
        s.id, s.title, s.artist, s.duration, s.url,
        pi.position, pi.playlist_item_id AS playlistItemId
      FROM playlist_items AS pi
      JOIN songs AS s ON pi.song_id = s.id
      ORDER BY pi.position ASC
    `);

    // 当前播放器状态
    const playerResult = await query("SELECT * FROM player_state LIMIT 1");

    res.json({
      playlist: playlistResult.rows,
      player: playerResult.rows[0],
    });
  } catch (err) {
    console.error("Error fetching player state:", err);
    res.status(500).json({ error: "Failed to fetch player state" });
  }
};
