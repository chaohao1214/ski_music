import db from "./databaseService.js";

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

export function getLatestStateAndBroadcast(ioInstance = io) {
  if (!ioInstance) {
    console.error(
      "Player state service has not been initialized with io instance."
    );
    return;
  }

  try {
    const playlistQuery = `SELECT
        s.id, s.title, s.artist, s.duration, s.url,
        pi.position, pi.id as playlistItemId
      FROM playlist_items AS pi
      JOIN songs AS s ON pi.song_id = s.id
      ORDER BY pi.position ASC;`;

    const playlist = db.prepare(playlistQuery).all();
    const fullState = {
      playlist: playlist,
      player: playerState,
    };
    ioInstance.to(roomName).emit("playlist:update", fullState);
    console.log("Broadcasted latest state to room:", roomName);
    console.log("🎵 Updated playlist state:", playlist);
  } catch (error) {
    console.error("Error fetching latest state for broadcast:", error);
  }
}

/**
 * Returns the latest state without broadcasting.
 * @returns {object} The current playlist and player state.
 */

export function getLatestState() {
  try {
    const playlistQuery = `SELECT
        s.id, s.title, s.artist, s.duration, s.url,
        pi.position, pi.id as playlistItemId
      FROM playlist_items AS pi
      JOIN songs AS s ON pi.song_id = s.id
      ORDER BY pi.position ASC;`;

    const playlist = db.prepare(playlistQuery).all();
    return {
      playlist,
      player: playerState,
    };
  } catch (error) {
    console.error("Error fetching latest state:", error);
    return {
      playlist: [],
      player: playerState,
    };
  }
}

/**
 * Updates the player's status (e.g., 'playing', 'paused').
 * @param {'playing' | 'paused' | 'stopped'} newStatus
 */

export function setPlayerStatus(newStatus) {
  playerState.status = newStatus;
}

/**
 * Sets the currently playing song.
 * @param {number | null} songId
 */

export function setCurrentSong(songId) {
  playerState.currentSongId = songId;
}

export const clearCurrentSongIfRemoved = (songId) => {
  if (playerState.currentSongId === songId) {
    playerState.currentSongId = -1;
    playerState.status = "stopped";
  }
};

export const getCurrentPlaylist = () => {
  try {
    const playlistQuery = `SELECT
      s.id, s.title, s.artist, s.duration, s.url,
      pi.position, pi.id as playlistItemId
    FROM playlist_items AS pi
    JOIN songs AS s ON pi.song_id = s.id
    ORDER BY pi.position ASC;`;

    const playlist = db.prepare(playlistQuery).all();
    return playlist;
  } catch (error) {
    console.error("Error fetching current playlist:", error);
    return [];
  }
};
