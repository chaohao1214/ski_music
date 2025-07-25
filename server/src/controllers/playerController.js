import {
  getCurrentPlaylist,
  getLatestState,
  getLatestStateAndBroadcast,
  setCurrentSong,
  setPlayerStatus,
  getCurrentSongId,
} from "../services/playerStateService.js";

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

export const getPlayerState = (req, res) => {
  const state = getLatestState();
  res.json(state);
};
