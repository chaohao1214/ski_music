import {
  Box,
  Button,
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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import "react-h5-audio-player/lib/styles.css";
import { useNavigate } from "react-router-dom";

const PlayerPage = () => {
  const audioRef = useRef();
  const socket = useSocket();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentPlaylist = useSelector(
    (state) => state.playlist?.currentPlaylist
  );
  const playerState = useSelector((state) => state.player.playerState);
  const nowPlaying =
    currentPlaylist?.find((song) => song.id === playerState.currentSongId) ||
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
        if (audioUnlocked && nowPlaying?.url) {
          audio.src = nowPlaying.url;
          audio
            .play()
            .then(() => console.log("Audio is playing"))
            .catch((e) => console.error("Audio play failed", e));
        } else {
          console.warn("Cannot play audio: audio is locked or url missing");
        }
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
          setAudioUnlocked(true);
        })
        .catch(() => {});
      window.removeEventListener("click", unlockAudio);
    };

    window.addEventListener("click", unlockAudio);
    return () => {
      window.removeEventListener("click", unlockAudio);
    };
  }, [nowPlaying?.url]);

  return (
    <Box
      sx={{
        width: "100vw",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: { xs: 2, md: 4 },
      }}
    >
      {" "}
      <Box sx={{ position: "absolute", top: 16, left: 16 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/")}
          sx={{
            color: "white",
            borderColor: "white",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderColor: "white",
            },
          }}
        >
          Home
        </Button>{" "}
      </Box>
      <Box
        sx={{
          width: "100%",
          maxWidth: "1400px",
        }}
      >
        {!audioUnlocked && (
          <Typography
            variant="body2"
            color="warning.main"
            sx={{ textAlign: "center", mb: 2 }}
          >
            🔒 Click anywhere to unlock audio playback
          </Typography>
        )}

        <Box
          display="flex"
          flexDirection={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems="flex-start"
          gap={{ xs: 4, md: 6 }}
        >
          {/* Left: Player and Info */}
          <Box
            flex={1}
            minWidth={{ xs: "100%", md: "50%" }}
            sx={{ px: { xs: 1, sm: 2 } }}
          >
            <Typography variant="h4" gutterBottom>
              Music Player
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Real-time music control interface
            </Typography>

            <AudioPlayer
              ref={audioRef}
              src={nowPlaying?.url}
              autoPlay={playerState?.status === "playing"}
              onPlay={() => console.log("Playing")}
              onPause={() => console.log("Paused")}
              onEnded={() => console.log("Ended")}
              style={{
                borderRadius: 8,
                marginTop: 16,
                width: "100%",
                fontSize: "1.2rem",
              }}
            />

            <Paper sx={{ mt: 3, p: 3 }}>
              <Typography variant="subtitle1">
                Now Playing:{" "}
                <strong>{nowPlaying ? nowPlaying.title : "None"}</strong>
              </Typography>
              <Typography color="text.secondary">
                Artist: {nowPlaying?.artist || "Unknown"}
              </Typography>
              <Typography mt={1}>Status: {playerState?.status}</Typography>
            </Paper>
          </Box>

          {/* Right: Playlist */}
          <Box
            flex={1}
            minWidth={{ xs: "100%", md: "50%" }}
            sx={{ px: { xs: 1, sm: 2 } }}
          >
            <Typography variant="h4" gutterBottom>
              Current Playlist
            </Typography>
            <Paper sx={{ maxHeight: 500, overflowY: "auto", p: 2 }}>
              <List>
                {currentPlaylist?.length > 0 ? (
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
                    <ListItemText primary="Playlist is empty" />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PlayerPage;
