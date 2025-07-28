import {
  getCurrentPlaylist,
  getLatestStateAndBroadcast,
  setCurrentSong,
  setPlayerStatus,
  getCurrentSongId,
} from "../services/playerStateService.js";
import { query } from "../services/postgresService.js";

const BASE_URL = process.env.BASE_URL || "http://localhost:3001";
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
  const playerResult = await query(`
    SELECT
      id,
      current_song_id AS "currentSongId",
      status
    FROM player_state
    LIMIT 1
  `);

  const playlistResult = await query(`
    SELECT
      pi.playlist_item_id AS "playlistItemId",
      pi.song_id AS "id",
      pi.position,
      s.title,
      s.artist,
      s.url,
      s.duration
    FROM playlist_items pi
    JOIN songs s ON pi.song_id = s.id
    ORDER BY pi.position ASC
  `);

  const player = playerResult.rows[0];

  res.json({
    player,
    playlist: playlistResult.rows.map((row) => ({
      ...row,
      url: `${BASE_URL}${row.url}`,
    })),
  });
};
