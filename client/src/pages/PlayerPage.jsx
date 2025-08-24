import { Box, Paper, Typography } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPlaylist,
  updatePlaylistOrder,
} from "../features/music/playlistSlice";
import AudioPlayer from "react-h5-audio-player";

import "react-h5-audio-player/lib/styles.css";
import CurrentPlaylist from "../components/CurrentPlaylist";
import { sendPlayerCommand } from "../features/music/playerSlice";
import { usePlayerSocket } from "../hooks/usePlayerSocket";
import BackButton from "../components/BackButton";
import { canDo } from "../utils/permissions";

const PlayerPage = () => {
  const audioRef = useRef();
  const dispatch = useDispatch();

  const currentPlaylist = useSelector(
    (state) => state.playlist?.currentPlaylist
  );
  const { user } = useSelector((state) => state.auth);
  const playerState = useSelector((state) => state.playlist?.playerState);

  // need a better way to solve unnecessary render
  const nowPlayingRef = useRef(null);
  const nowPlaying = useMemo(() => {
    const found = currentPlaylist.find(
      (song) => song.id === playerState.currentSongId
    );
    if (found) {
      nowPlayingRef.current = found;
      return found;
    }
    return nowPlayingRef.current;
  }, [playerState.currentSongId, currentPlaylist]);

  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const canControl = canDo(user?.role, "controlPlayback");

  useEffect(() => {
    dispatch(fetchPlaylist());
  }, [dispatch]);

  console.log("nowPlaying", nowPlaying);

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
      <BackButton />

      <Box sx={{ width: "100%", maxWidth: "1400px" }}>
        {!audioUnlocked && (
          <Typography
            variant="body2"
            color="warning.main"
            sx={{
              textAlign: "center",
              mb: 2,
              mt: { xs: 3, sm: 2 },
              px: { xs: 1 },
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
              whiteSpace: "normal",
              lineHeight: 1.3,
            }}
          >
            🔒 Click anywhere to unlock audio playback
          </Typography>
        )}

        <Box
          display="flex"
          flexDirection={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{
            gap: { xs: 4, md: 0 },
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: 3,
          }}
        >
          {/* Left Panel: Player */}
          <Box
            flex={1}
            minWidth={{ xs: "100%", md: "50%" }}
            sx={{
              px: { xs: 1, sm: 2 },
              borderRight: { md: "1px solid rgba(255,255,255,0.05)" },
              borderColor: "divider", // 主题色
            }}
          >
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                display: { xs: "none", sm: "block" },
              }}
            >
              Music Player
            </Typography>

            <AudioPlayer
              ref={audioRef}
              src={nowPlaying?.url || ""}
              // only happens from home page to player, need audioUnlocked
              autoPlay={audioUnlocked && playerState?.status === "playing"}
              showSkipControls={canControl}
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
            sx={{
              px: { xs: 1, sm: 2 },
              "& .MuiTypography-root": {
                fontSize: { xs: "0.9rem", sm: "1rem" }, // 手机小一点
                lineHeight: 1.4,
              },
            }}
          >
            <CurrentPlaylist
              currentPlaylist={currentPlaylist}
              nowPlayingId={playerState.currentSongId}
              onReorder={(newOrder) => {
                dispatch(updatePlaylistOrder(newOrder));
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PlayerPage;
