import {
  getLatestState,
  getLatestStateAndBroadcast,
  setCurrentSong,
  setPlayerStatus,
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
      if (songId) {
        setCurrentSong(songId);
      }
      setPlayerStatus("playing");
      break;
    case "pause":
      setPlayerStatus("paused");
      break;
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
