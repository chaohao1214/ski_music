import React from "react";
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  Typography,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PropTypes from "prop-types";

const CurrentPlaylist = ({
  currentPlaylist,
  nowPlayingId,
  onRemove,
  showDelete = true,
  showIndex = false,
}) => {
  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Current Playlist
      </Typography>
      <Paper sx={{ maxHeight: 500, overflowY: "auto", p: 2 }}>
        <List>
          {currentPlaylist?.length > 0 ? (
            currentPlaylist.map((song, index) => (
              <ListItem
                key={song.playlistItemId}
                selected={song.id === nowPlayingId}
                sx={{
                  borderLeft:
                    song.id === nowPlayingId
                      ? "4px solid #4cafef"
                      : "4px solid transparent",
                  bgcolor:
                    song.id === nowPlayingId
                      ? "rgba(76, 175, 239, 0.08)"
                      : "transparent",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.04)",
                  },
                  transition: "all 0.2s ease",
                }}
                secondaryAction={
                  showDelete && onRemove ? (
                    <Tooltip title="Remove from playlist">
                      <IconButton
                        edge="end"
                        onClick={() => onRemove(song.playlistItemId)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  ) : null
                }
              >
                <ListItemText
                  primary={
                    showIndex ? `${index + 1}. ${song.title}` : song.title
                  }
                  secondary={song.artist || "Unknown Artist"}
                />
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="Playlist is empty" />
            </ListItem>
          )}
        </List>
      </Paper>
    </div>
  );
};

CurrentPlaylist.propTypes = {
  currentPlaylist: PropTypes.array.isRequired,
  nowPlayingId: PropTypes.string,
  onRemove: PropTypes.func,
  showDelete: PropTypes.bool,
  showIndex: PropTypes.bool,
};

export default CurrentPlaylist;
