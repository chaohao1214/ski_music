import { SOCKET_EVENTS } from "../constans/socketEvent.js";
import {
  getCurrentPlaylist,
  getLatestStateAndBroadcast,
  setCurrentSong,
  setPlayerStatus,
  getCurrentSongId,
} from "../services/playerStateService.js";
import { query } from "../services/postgresService.js";

import dotenv from "dotenv";
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
const SUPABASE_BASE_URL = process.env.SUPABASE_URL;
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET;
export const getPlayerStateFromDB = async () => {
  const result = await query(`
    SELECT
      id,
      current_song_id AS "currentSongId",
      status
    FROM player_state
    LIMIT 1
  `);
  return result.rows[0];
};

export const changeTrack = async (direction, io) => {
  const playlist = await getCurrentPlaylist();
  const currentSongId = await getCurrentSongId();

  if (playlist.length === 0) {
    return { error: "Playlist is empty" };
  }

  const currentIndex = playlist.findIndex(
    (item) => item.songId === currentSongId
  );
  if (currentIndex === -1) {
    return { error: "Current song not found" };
  }
  let newIndex;
  if (direction === "next") {
    newIndex = (currentIndex + 1) % playlist.length;
  } else if (direction === "prev") {
    newIndex = (currentIndex - 1 + playlist.length) % playlist.length;
  } else {
    return { error: "Invalid direction" };
  }

  const newSong = playlist[newIndex];
  setCurrentSong(newSong.songId);
  setPlayerStatus("playing");

  io.to(SOCKET_EVENTS.ROOM_NAME).emit(SOCKET_EVENTS.EXECUTE, {
    action: "PLAY",
    songId: newSong.songId,
  });
  return { success: true };
};

/**
 * @desc    Handle player actions like play and pause
 * @route   POST /api/player/action
 */
export const handlePlayerAction = async (req, res) => {
  const { action, songId } = req.body;
  if (!action) {
    return res.status(400).json({ message: "Action is required" });
  }

  switch (action.toLowerCase()) {
    case "resume":
      setPlayerStatus("playing");
      req.io
        .to(SOCKET_EVENTS.ROOM_NAME)
        .emit(SOCKET_EVENTS.EXECUTE, { action: "RESUME" });
      break;
    case "play":
      let selectedSongId = songId;
      if (!selectedSongId) {
        const { currentSongId } = await getPlayerStateFromDB();

        if (currentSongId) {
          selectedSongId = currentSongId;
        } else {
          const playlist = await getCurrentPlaylist();
          if (playlist.length === 0) {
            return res
              .status(400)
              .json({ message: "Playlist is empty. Cannot play." });
          }
          selectedSongId = playlist[0].songId; // fallback to first
        }
      }
      setPlayerStatus("playing");
      setCurrentSong(selectedSongId);

      req.io.to(SOCKET_EVENTS.ROOM_NAME).emit(SOCKET_EVENTS.EXECUTE, {
        action: "PLAY",
        songId: selectedSongId,
      });
      break;
    case "pause":
      setPlayerStatus("paused");
      req.io.to(SOCKET_EVENTS.ROOM_NAME).emit(SOCKET_EVENTS.EXECUTE, {
        action: "PAUSE",
      });
      break;
    case "next": {
      const result = await changeTrack("next", req.io);
      if (result.error) {
        return res.status(400).json({ message: result.error });
      }
      break;
    }
    case "prev": {
      const result = await changeTrack("prev", req.io);
      if (result.error) {
        return res.status(400).json({ message: result.error });
      }
      break;
    }
    case "stop":
      setPlayerStatus("stopped");
      req.io.to(SOCKET_EVENTS.ROOM_NAME).emit(SOCKET_EVENTS.EXECUTE, {
        action: "STOP",
      });
      break;
    default:
      return res.status(400).json({ message: `Unknown action: ${action}` });
  }
  getLatestStateAndBroadcast(req.io);
  res.status(200).json({ message: `Player state updated to ${action}` });
};

export const getPlayerState = async (req, res) => {
  try {
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
        url: isProduction
          ? `${SUPABASE_BASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${row.url}`
          : `http://localhost:3001/uploads/${row.url}`,
      })),
    });
  } catch (error) {
    console.error("PlayerState error:", error);
    res.status(500).json({ error: "Failed to fetch player state" });
  }
};
