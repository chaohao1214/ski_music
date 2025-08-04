// components/SongLibrary.jsx
import React, { useEffect } from "react";
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress,
  Tooltip,
  Typography,
  Box,
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadZone from "./UploadZone";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSongLibrary,
  deleteSongFromLibrary,
} from "../features/music/songLibrarySlice";
import {
  addSongToPlaylist,
  fetchPlaylist,
} from "../features/music/playlistSlice";
import { enqueueSnackbar } from "notistack";

const SongLibrary = () => {
  const dispatch = useDispatch();
  const { songLibrary, status } = useSelector((state) => state.songs);
  const { currentPlaylist } = useSelector((state) => state.playlist);

  useEffect(() => {
    dispatch(fetchSongLibrary());
  }, [dispatch]);

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

  const handleDeleteSong = async (songId) => {
    try {
      await dispatch(deleteSongFromLibrary(songId)).unwrap();
      enqueueSnackbar("Deleted successfully!", { variant: "success" });
      await dispatch(fetchSongLibrary()).unwrap();
    } catch (err) {
      console.error("❌ Delete failed:", err);
      enqueueSnackbar("Failed to delete", { variant: "error" });
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Song Library
      </Typography>

      {status === "loading" && <CircularProgress sx={{ my: 2 }} />}

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
                  <IconButton onClick={() => handleAddSong(song.id)}>
                    <AddCircleIcon color="primary" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Remove song from song library">
                  <IconButton onClick={() => handleDeleteSong(song.id)}>
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
  );
};

export default SongLibrary;
