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
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPlaylist,
  updatePlaylistFromSocket,
} from "../features/music/playlistSlice";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";

const PlayerPage = () => {
  const audioRef = useRef();
  const socket = useSocket();
  const dispatch = useDispatch();
  const currentPlaylist = useSelector(
    (state) => state.playlist?.currentPlaylist
  );
  const playerState = useSelector((state) => state.player.playerState);
  const nowPlaying =
    currentPlaylist.find((song) => song.id === playerState.currentSongId) ||
    null;

  const [audioUnlocked, setAudioUnlocked] = useState(false);

  useEffect(() => {
    socket.connect();

    const handlePlaylistUpdate = (newState) => {
      console.log("Player Client: Received playlist:update", newState);
      dispatch(updatePlaylistFromSocket(newState));
    };

    // --- Event Handler for receiving playback commands ---
    const handleExecuteCommand = (data) => {
      console.log("Player Client: Received player:execute", data);
      const audio = audioRef.current?.audio?.current;
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

  useEffect(() => {
    dispatch(fetchPlaylist());
  }, [dispatch]);

  // 📌 Workaround for autoplay restrictions
  // Browsers block audio.play() unless it's triggered by a user interaction
  useEffect(() => {
    const audio = audioRef.current?.audio?.current;
    if (!audio || !nowPlaying?.url) return;

    const unlockAudio = () => {
      audio.muted = true;
      audio
        .play()
        .then(() => {
          audio.pause();
          audio.muted = false;
          console.log("🔓 Audio unlocked by user interaction");
          setAudioUnlocked(true);
        })
        .catch((err) => {
          console.warn("❌ Unlock failed", err);
        });

      window.removeEventListener("click", unlockAudio);
    };

    window.addEventListener("click", unlockAudio);
    return () => {
      window.removeEventListener("click", unlockAudio);
    };
  }, [nowPlaying?.url]);

  return (
    <Container maxWidth="md">
      {!audioUnlocked && (
        <Typography
          variant="body2"
          color="warning.main"
          sx={{ textAlign: "center", mt: 2 }}
        >
          🔒 Audio is locked. Click anywhere on this page to enable playback.
        </Typography>
      )}
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Player Client
        </Typography>
        <Typography color="text.secondary">
          {" "}
          The view listens for real-time commands to play musice
        </Typography>{" "}
      </Box>

      <AudioPlayer
        ref={audioRef}
        src={nowPlaying?.url}
        autoPlay={playerState.status === "playing"}
        onPlay={() => console.log("🔊 Playing")}
        onPause={() => console.log("⏸ Paused")}
        onEnded={() => console.log("⏹ Ended")}
      />
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
          {currentPlaylist.length > 0 ? (
            currentPlaylist.map((song, index) => (
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
