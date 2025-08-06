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
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const CurrentPlaylist = ({
  currentPlaylist,
  nowPlayingId,
  onRemove,
  onReorder,
  showDelete = true,
  showIndex = false,
}) => {
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reordered = Array.from(currentPlaylist);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    if (onReorder) {
      onReorder(reordered);
    }
  };

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Current Playlist
      </Typography>
      <Paper sx={{ maxHeight: 500, overflowY: "auto", p: 2 }}>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="playlist">
            {(provided) => (
              <List {...provided.droppableProps} ref={provided.innerRef}>
                {currentPlaylist?.length > 0 ? (
                  currentPlaylist.map((song, index) => (
                    <Draggable
                      key={song.playlistItemId}
                      draggableId={String(song.playlistItemId)}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <ListItem
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          selected={song.id === nowPlayingId}
                          sx={{
                            borderLeft:
                              song.id === nowPlayingId
                                ? "4px solid #4cafef"
                                : "4px solid transparent",
                            bgcolor: snapshot.isDragging
                              ? "rgba(255, 255, 255, 0.08)"
                              : song.id === nowPlayingId
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
                              showIndex
                                ? `${index + 1}. ${song.title}`
                                : song.title
                            }
                            secondary={song.artist || "Unknown Artist"}
                          />
                        </ListItem>
                      )}
                    </Draggable>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="Playlist is empty" />
                  </ListItem>
                )}
                {provided.placeholder}
              </List>
            )}
          </Droppable>
        </DragDropContext>
      </Paper>
    </div>
  );
};

CurrentPlaylist.propTypes = {
  currentPlaylist: PropTypes.array.isRequired,
  nowPlayingId: PropTypes.string,
  onRemove: PropTypes.func,
  onReorder: PropTypes.func,
  showDelete: PropTypes.bool,
  showIndex: PropTypes.bool,
};

export default CurrentPlaylist;
