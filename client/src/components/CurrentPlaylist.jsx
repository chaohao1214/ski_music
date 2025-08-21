import React, { useEffect, useMemo, useState } from "react";
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
import { useDispatch, useSelector } from "react-redux";
import { reorderPlaylistAndSync } from "../features/music/playlistSlice";
import { canDo } from "../utils/permissions";

const CurrentPlaylist = ({
  currentPlaylist,
  nowPlayingId,
  onRemove,
  showDelete = true,
  showIndex = false,
}) => {
  // 1) Local view list for optimistic rendering while reordering.
  const [viewList, setViewList] = useState(currentPlaylist || []);
  const [isReordering, setIsReordering] = useState(false);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const canReorder = useMemo(
    () => canDo(user?.role, "reorderPlaylist"),
    [user?.role]
  );
  const canRemove = useMemo(
    () => canDo(user?.role, "removeFromList"),
    [user?.role]
  );
  // 2) Sync local view list from global playlist when we are not in a reorder cycle.
  useEffect(() => {
    if (!isReordering) setViewList(currentPlaylist || []);
  }, [currentPlaylist, isReordering]);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    if (!canReorder) return;

    const reorderList = Array.from(viewList);
    const [moved] = reorderList.splice(result.source.index, 1);
    reorderList.splice(result.destination.index, 0, moved);

    // Optimistically update local list for smooth UX.
    setViewList(reorderList);
    setIsReordering(true);

    // dispatch(reorderPlaylistAndSync(reordered));
    // Prepare payload for backend: [{ playlistItemId, position }]
    const playlistOrder = reorderList.map((song, index) => ({
      playlistItemId: song.playlistItemId,
      position: index + 1,
    }));

    try {
      await dispatch(reorderPlaylistAndSync(playlistOrder).unwrap?.());
    } catch (error) {
    } finally {
      setIsReordering(false);
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
                {viewList?.length > 0 ? (
                  viewList.map((song, index) => (
                    <Draggable
                      key={song.playlistItemId}
                      draggableId={String(song.playlistItemId)}
                      index={index}
                      isDragDisabled={!canReorder}
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
                                  disabled={!canRemove}
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
                            secondary={
                              song.artist ? (
                                song.artist
                              ) : (
                                <Typography
                                  component="span"
                                  sx={{ opacity: 0 }}
                                >
                                  &nbsp;
                                </Typography>
                              )
                            }
                            slotProps={{
                              secondary: {
                                sx: { display: "block", minHeight: 20 },
                              },
                            }}
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
