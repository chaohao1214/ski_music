import {
  Box,
  Container,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import { useSocket } from "../contexts/SocketContext";
import { useEffect, useRef, useState } from "react";

const PlayerPage = () => {
  const audioRef = useRef();
  const socket = useSocket();

  const [playlist, setPlaylist] = useState([]);
  const [nowPlaying, setNowPlaying] = useState(null);
  const [playerState, setPlayerState] = useState({ status: "stopped" });

  useEffect(() => {
    socket.connect();

    const handlePlaylistUpdate = (newState) => {
      console.log("Player Client: Received playlist:update", newState);
      setPlaylist(newState.playlist);
      setPlayerState(newState.player);

      // Logic to determine what song should be playing
      const currentSongInPlaylist = newState.playlist.find(
        (song) => song.id === newState.player.currentSongId
      );
      setNowPlaying(
        currentSongInPlaylist ||
          (newState.playlist.length > 0 ? newState.playlist[0] : null)
      );
    };

    // --- Event Handler for receiving playback commands ---
    const handleExecuteCommand = (data) => {
      console.log("Player Client: Received player:execute", data);
      const audio = audioRef.current;
      if (!audio) return;

      if (data.action === "PLAY") {
        audio.play().catch((e) => console.error("Audio play failed"));
      } else if (data.action === "PAUSE") {
        audio.pause();
      }
    };
    // TODO: Handle 'NEXT', 'PREVIOUS', 'SEEK' commands

    // Start listening for events from the server
    socket.on("playlist:update", handlePlaylistUpdate);
    socket.on("player:execute", handleExecuteCommand);

    socket.emit("playlist:get_state");

    return () => {
      socket.off("playlist:update", handlePlaylistUpdate);
      socket.off("player:execute", handleExecuteCommand);
      socket.disconnect();
    };
  }, [socket]);
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Player Client
        </Typography>
        <Typography color="text.secondary">
          {" "}
          The view listens for real-time commands to play musice
        </Typography>{" "}
      </Box>
      <audio ref={audioRef} src={nowPlaying?.url} controls />

      <Paper sx={{ mt: 2 }}>
        <List>
          <ListItem>
            <ListItemText
              primary="Now Playing: "
              secondary={
                nowPlaying
                  ? `${nowPlaying.title} -${nowPlaying.artist}`
                  : "None"
              }
            />
          </ListItem>
          <ListItem>
            <ListItemText primary="Status:" secondary={playerState.status} />
          </ListItem>
        </List>
      </Paper>

      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
        Current Playlist
      </Typography>
      <Paper>
        <List>
          {playlist.length > 0 ? (
            playlist.map((song, index) => (
              <ListItem
                key={song.playlistItemId}
                selected={song.id === nowPlaying?.id}
              >
                <ListItemText
                  primary={`${index + 1}. ${song.title}`}
                  secondary={song.artist || "Unknown Artist"}
                />
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="Playlist is empty. Waiting for controller..." />
            </ListItem>
          )}
        </List>
      </Paper>
    </Container>
  );
};

export default PlayerPage;
