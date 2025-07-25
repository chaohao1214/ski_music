import { query } from "./postgresService.js";
const roomName = "music-control-room";
let io = null; // initialize this form server.js

let playerState = {
  currentSongId: -1, // -1 means nothing is selected
  status: "stopped", // 'playing', 'paused', 'stopped'
};

/**
 * Initializes the service with the Socket.IO instance.
 * @param {object} socketIoInstance - The main Socket.IO server instance.
 */

export function initPlayerStateService(socketIoInstance) {
  io = socketIoInstance;
}

/**
 * Fetches the latest full state and broadcasts it to all clients in the room.
 */

export async function getLatestStateAndBroadcast(ioInstance = io) {
  if (!ioInstance) {
    console.error(
      "Player state service has not been initialized with io instance."
    );
    return;
  }

  try {
    const result = await query(`
      SELECT
        s.id, s.title, s.artist, s.duration, s.url,
        pi.position, pi.id AS playlistItemId
      FROM playlist_items AS pi
      JOIN songs AS s ON pi.song_id = s.id
      ORDER BY pi.position ASC
    `);

    const fullState = {
      playlist: result.rows,
      player: await getLatestState(), // Fetch latest playerState from DB
    };

    ioInstance.to(roomName).emit("playlist:update", fullState);
    console.log("Broadcasted latest state to room:", roomName);
    console.log("🎵 Updated playlist state:", fullState.playlist);
  } catch (error) {
    console.error("Error fetching latest state for broadcast:", error);
  }
}

/**
 * Returns the latest state without broadcasting.
 * @returns {object} The current playlist and player state.
 */

export const getLatestState = async () => {
  const result = await query("SELECT * FROM player_state LIMIT 1");
  return result.rows[0];
};

/**
 * Updates the player's status (e.g., 'playing', 'paused').
 * @param {'playing' | 'paused' | 'stopped'} newStatus
 */

export const setPlayerStatus = async (status) => {
  await query("UPDATE player_state SET status = $1", [status]);
};

/**
 * Sets the currently playing song.
 * @param {number | null} songId
 */

export const setCurrentSong = async (songId) => {
  await query("UPDATE player_state SET current_song_id = $1", [songId]);
};

export async function clearCurrentSongIfRemoved(songId) {
  const { current_song_id } = await getLatestState();
  if (current_song_id === songId) {
    await query(
      "UPDATE player_state SET current_song_id = NULL, status = 'stopped'"
    );
  }
}

export const getCurrentPlaylist = async () => {
  const result = await query("SELECT * FROM playlist ORDER BY position ASC");
  return result.rows;
};

export async function getCurrentSongId() {
  const { current_song_id } = await getLatestState();
  return current_song_id;
}
