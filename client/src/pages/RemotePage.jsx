import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Button, IconButton, Tooltip, Typography } from "@mui/material";
import { logout } from "../features/auth/authSlice";

import { useSocket } from "../contexts/SocketContext";
import UploadZone from "../components/UploadZone";
import { enqueueSnackbar } from "notistack";
import { fetchSongLibrary } from "../features/music/songLibrarySlice";
import { sendPlayerCommand } from "../features/music/playerSlice";
import {
  fetchPlaylist,
  removeSongFromPlaylist,
  reorderPlaylist,
  updatePlaylistOrder,
} from "../features/music/playlistSlice";
import { useNavigate } from "react-router-dom";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import StopIcon from "@mui/icons-material/Stop";
import CurrentPlaylist from "../components/CurrentPlaylist";
import SongLibrary from "../components/SongLibrary";
import BackButton from "../components/BackButton";

const RemotePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const socket = useSocket();
  const { user } = useSelector((state) => state.auth);
  const { currentPlaylist } = useSelector((state) => state.playlist);
  const { playerState } = useSelector((state) => state.playlist);
  useEffect(() => {
    socket.connect();

    dispatch(fetchSongLibrary());
    dispatch(fetchPlaylist());

    return () => {
      socket.disconnect();
    };
  }, [dispatch, socket]);

  const handlePlayPause = () => {
    if (currentPlaylist.length === 0) {
      enqueueSnackbar("Playlist is empty!", { variant: "warning" });
      return;
    }
    switch (playerState.status) {
      case "paused":
        dispatch(sendPlayerCommand({ action: "RESUME" }));
        enqueueSnackbar("Resuming playback...", { variant: "info" });
        break;
      case "playing":
        dispatch(sendPlayerCommand({ action: "PAUSE" }));
        enqueueSnackbar("Pausing...", { variant: "info" });
        break;
      default:
        dispatch(sendPlayerCommand({ action: "PLAY" }));
        enqueueSnackbar("Starting playback...", { variant: "info" });
        break;
    }
  };

  const handleNext = () => {
    dispatch(sendPlayerCommand({ action: "NEXT" }));
  };

  const handlePrev = () => {
    dispatch(sendPlayerCommand({ action: "PREV" }));
  };

  const handleStop = () => {
    dispatch(sendPlayerCommand({ action: "STOP" }));
    enqueueSnackbar("Stopped", { variant: "info" });
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <Box
      sx={{
        width: "100vw",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: { xs: 2, md: 4 },
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      <BackButton />
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          width: "100%",
          maxWidth: "1400px",
          gap: { xs: 2, md: 4 },
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: { md: 3, xs: "none" },
        }}
      >
        {/* Left Panel */}
        <Box
          flex={1}
          sx={{
            px: { xs: 1, sm: 2 },
            borderRight: {
              md: "1px solid",
            },
            borderColor: { md: "divider" },
          }}
        >
          <Typography
            variant="h4"
            gutterBottom
            sx={{ display: { xs: "none", sm: "block" } }}
          >
            Music Controller
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography component="span" sx={{ mr: 2 }}>
              Welcome, {user?.username} ({user?.role})
            </Typography>
            <Button onClick={handleLogout} sx={{ color: "white" }}>
              Logout
            </Button>
          </Box>

          <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
            <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
              <Tooltip title="Previous">
                <IconButton onClick={handlePrev}>
                  <SkipPreviousIcon />
                </IconButton>
              </Tooltip>

              <Tooltip
                title={playerState.status === "playing" ? "Pause" : "Play"}
              >
                <IconButton onClick={handlePlayPause}>
                  {playerState.status === "playing" ? (
                    <PauseIcon />
                  ) : (
                    <PlayArrowIcon />
                  )}
                </IconButton>
              </Tooltip>

              <Tooltip title="Next">
                <IconButton onClick={handleNext}>
                  <SkipNextIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Stop">
                <IconButton onClick={handleStop}>
                  <StopIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Box>
            <UploadZone />
            <SongLibrary />
          </Box>
        </Box>

        {/* Right Panel */}
        <Box flex={1} sx={{ px: { xs: 1, sm: 2 } }}>
          <CurrentPlaylist
            currentPlaylist={currentPlaylist}
            nowPlayingId={playerState.currentSongId}
            onRemove={(playlistItemId) =>
              dispatch(removeSongFromPlaylist(playlistItemId))
            }
          />
        </Box>
      </Box>
    </Box>
  );
};

export default RemotePage;
