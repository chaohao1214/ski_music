import { Box, Button, Paper, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPlaylist } from "../features/music/playlistSlice";
import AudioPlayer from "react-h5-audio-player";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import "react-h5-audio-player/lib/styles.css";
import { useNavigate } from "react-router-dom";

import CurrentPlaylist from "../components/CurrentPlaylist";
import { sendPlayerCommand } from "../features/music/playerSlice";
import { usePlayerSocket } from "../hooks/usePlayerSocket";

const PlayerPage = () => {
  const audioRef = useRef();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const currentPlaylist = useSelector(
    (state) => state.playlist?.currentPlaylist
  );
  const playerState = useSelector((state) => state.playlist?.playerState);

  const nowPlaying =
    currentPlaylist.find((song) => song.id === playerState.currentSongId) ||
    null;

  const [audioUnlocked, setAudioUnlocked] = useState(false);

  useEffect(() => {
    dispatch(fetchPlaylist());
  }, [dispatch]);

  console.log("nowPlaying", nowPlaying);
  console.log("currentPlaylist", currentPlaylist);

  usePlayerSocket(dispatch, audioRef, audioUnlocked, nowPlaying);

  // Unlock audio via user interaction
  useEffect(() => {
    if (audioUnlocked) return;

    const unlockAudio = () => {
      const audio = audioRef.current?.audio?.current;

      if (!audio || !nowPlaying?.url) return;

      audio.muted = true;
      audio.src = nowPlaying.url;
      audio
        .play()
        .then(() => {
          audio.pause();
          audio.muted = false;
          setAudioUnlocked(true);
          window.removeEventListener("click", unlockAudio);
        })
        .catch((err) => {
          console.warn("Unlock failed", err);
        });
    };

    window.addEventListener("click", unlockAudio);
    return () => {
      window.removeEventListener("click", unlockAudio);
    };
  }, [audioUnlocked, nowPlaying?.id]);

  const handleNextSong = () => {
    if (!currentPlaylist || currentPlaylist.length === 0) return;
    let currentIndex = currentPlaylist.findIndex(
      (song) => song.id === playerState.currentSongId
    );

    let nextIndex = currentIndex + 1;
    if (nextIndex >= currentPlaylist.length) {
      nextIndex = 0;
    }

    const nextSong = currentPlaylist[nextIndex];
    if (nextSong) {
      dispatch(sendPlayerCommand({ action: "PLAY", songId: nextSong.id }));
    }
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
      }}
    >
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
        </Button>
      </Box>

      <Box sx={{ width: "100%", maxWidth: "1400px" }}>
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
          {/* Left Panel: Player */}
          <Box
            flex={1}
            minWidth={{ xs: "100%", md: "50%" }}
            sx={{ px: { xs: 1, sm: 2 } }}
          >
            <Typography variant="h4" gutterBottom>
              Music Player
            </Typography>

            <AudioPlayer
              ref={audioRef}
              src={nowPlaying?.url}
              autoPlay={playerState?.status === "playing"}
              showSkipControls
              showJumpControls={false}
              onPlay={() => console.log("Playing")}
              onPause={() => console.log("Paused")}
              onClickNext={(e) => {
                e.stopPropagation();
                dispatch(sendPlayerCommand({ action: "NEXT" }));
              }}
              onClickPrevious={(e) => {
                e.stopPropagation();
                dispatch(sendPlayerCommand({ action: "PREV" }));
              }}
              onEnded={handleNextSong}
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

          {/* Right Panel: Playlist */}
          <Box
            flex={1}
            minWidth={{ xs: "100%", md: "50%" }}
            sx={{ px: { xs: 1, sm: 2 } }}
          >
            <CurrentPlaylist
              currentPlaylist={currentPlaylist}
              nowPlayingId={playerState.currentSongId}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PlayerPage;
