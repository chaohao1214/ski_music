import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import { logout } from "../features/auth/authSlice";

import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import { useSocket } from "../contexts/SocketContext";
import UploadZone from "../components/UploadZone";
import { enqueueSnackbar } from "notistack";
import {
  deleteSongFromLibrary,
  fetchSongLibrary,
} from "../features/music/songLibrarySlice";
import {
  addSongToPlaylist,
  fetchPlaylist,
  removeSongFromPlaylist,
} from "../features/music/playlistSlice";
import { useNavigate } from "react-router-dom";
const ControlInterface = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const socket = useSocket();
  const { user } = useSelector((state) => state.auth);
  const { songLibrary, status: musicStatus } = useSelector(
    (state) => state.songs
  );
  const { currentPlaylist } = useSelector((state) => state.playlist);

  useEffect(() => {
    socket.connect();

    dispatch(fetchSongLibrary());
    dispatch(fetchPlaylist());

    return () => {
      socket.disconnect();
    };
  }, [dispatch, socket]);

  const handleAddSong = (songId) => {
    const isDuplicate = currentPlaylist.some((song) => song.id === songId);
    if (isDuplicate) {
      enqueueSnackbar("The song is already in the playlist", {
        variant: "info",
      });
    } else {
      dispatch(addSongToPlaylist(songId));
      dispatch(fetchPlaylist());
    }
  };
  const handleDeleteSong = (songId) => {
    dispatch(deleteSongFromLibrary(songId));
    enqueueSnackbar("Deleted successfully!", { variant: "success" });
    dispatch(fetchSongLibrary());
  };

  const handlePlay = () => {
    if (currentPlaylist.length === 0) {
      enqueueSnackbar("Playlist is empty!", { variant: "warning" });
      return;
    }

    socket.emit("player:command", {
      action: "PLAY",
      songId: currentPlaylist[0].id,
    });
  };

  const handlePause = () => {
    socket.emit("player:command", { action: "PAUSE" });
  };

  const handleNext = () => {
    socket.emit("play:command", { action: "NEXT" });
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
        p: 4,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          width: "100%",
          maxWidth: "1400px",
          gap: 4,
        }}
      >
        {/* Left Panel */}
        <Box flex={1}>
          <Typography variant="h4" gutterBottom>
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

          <Box sx={{ mb: 2 }}>
            <Button sx={{ mr: 1 }} variant="contained" onClick={handlePlay}>
              Play
            </Button>
            <Button sx={{ mr: 1 }} variant="contained" onClick={handlePause}>
              Pause
            </Button>
            <Button sx={{ mr: 1 }} variant="contained" onClick={handleNext}>
              Next
            </Button>
          </Box>

          {musicStatus === "loading" && <CircularProgress sx={{ my: 2 }} />}

          <Box>
            <Typography variant="h5" gutterBottom>
              Song Library
            </Typography>
            <UploadZone />
            <List
              sx={{
                bgcolor: "background.paper",
                borderRadius: 2,
                maxHeight: "60vh",
                overflow: "auto",
                mt: 1,
              }}
            >
              {songLibrary.map((song) => (
                <ListItem
                  key={song.id}
                  secondaryAction={
                    <>
                      <Tooltip title="Add song to playlist">
                        <IconButton
                          edge="end"
                          aria-label="add"
                          onClick={() => handleAddSong(song.id)}
                        >
                          <AddCircleIcon color="primary" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Remove song from song library">
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDeleteSong(song.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  }
                >
                  <ListItemText
                    primary={song.title}
                    secondary={song.artist || "Unknown Artist"}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>

        {/* Right Panel */}
        <Box flex={1}>
          <Typography variant="h5" gutterBottom>
            Current Playlist
          </Typography>
          <List
            sx={{
              bgcolor: "background.paper",
              borderRadius: 2,
              maxHeight: "80vh",
              overflow: "auto",
            }}
          >
            {currentPlaylist?.map((song) => (
              <ListItem
                key={song.playlistitemid}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() =>
                      dispatch(removeSongFromPlaylist(song.playlistitemid))
                    }
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={song.title}
                  secondary={song.artist || "Unknown Artist"}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
    </Box>
  );
};

export default ControlInterface;
