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
import {
  addSongToPlaylist,
  deleteSongFromLibrary,
  fetchPlaylist,
  fetchSongLibrary,
  removeSongFromPlaylist,
} from "../features/music/musicSlice";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import { useSocket } from "../contexts/SocketContext";
import UploadZone from "./UploadZone";
import { enqueueSnackbar } from "notistack";
const ControlInterface = () => {
  const dispatch = useDispatch();
  const socket = useSocket();
  const { user } = useSelector((state) => state.auth);
  const {
    songLibrary,
    status: musicStatus,
    currentPlaylist,
  } = useSelector((state) => state.music);

  useEffect(() => {
    socket.connect();

    dispatch(fetchSongLibrary());
    dispatch(fetchPlaylist());

    return () => {
      socket.disconnect();
    };
  }, [dispatch, socket]);

  const handleAddSong = (songId) => {
    dispatch(addSongToPlaylist(songId));
    dispatch(fetchPlaylist());
  };
  const handleDeleteSong = (songId) => {
    dispatch(deleteSongFromLibrary(songId));
    enqueueSnackbar("Deleted successfully!", { variant: "success" });
    dispatch(fetchSongLibrary());
  };

  const handlePlay = () => {
    socket.emit("player:command", { action: "PLAY" });
  };

  const handlePause = () => {
    socket.emit("player:command", { action: "PAUSE" });
  };

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          my: 4,
        }}
      >
        <Typography variant="h4">Control Interface</Typography>
      </Box>
      <Box>
        <Typography component="span" sx={{ mr: 2 }}>
          Welcome, {user?.username} ({user?.role})
        </Typography>
        <Button onClick={() => dispatch(logout())} sx={{ color: "white" }}>
          Logout
        </Button>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Button sx={{ mr: 1 }} variant="contained" onClick={handlePlay}>
          Play
        </Button>
        <Button variant="contained" onClick={handlePause}>
          Pause
        </Button>
      </Box>

      {musicStatus === "loading" && <CircularProgress />}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
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
        </Grid>
      </Grid>

      <Grid item xs={12} md={6}>
        <Typography variant="h5" gutterBottom>
          Current Playlist
        </Typography>
        <List
          sx={{
            bgcolor: "background.paper",
            borderRadius: 2,
            maxHeight: "60vh",
            overflow: "auto",
          }}
        >
          {currentPlaylist.map((song) => (
            <ListItem
              key={song.playlistItemId}
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() =>
                    dispatch(removeSongFromPlaylist(song.playlistItemId))
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
      </Grid>
    </Container>
  );
};

export default ControlInterface;
