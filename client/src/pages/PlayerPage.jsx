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

  usePlayerSocket(dispatch, audioRef, audioUnlocked, nowPlaying);

  // Unlock audio via user interaction
  useEffect(() => {
    // install only when we actually have a playable URL and not unlocked yet
    if (audioUnlocked || !nowPlaying?.url) return;

    const audio = audioRef.current?.audio?.current;
    if (!audio) return;

    // Ask the element to finalize resource selection (helps reach canplay sooner)
    try {
      audio.load?.();
    } catch {}

    const onUnlock = async () => {
      // Guard: the element must have a currentSrc bound
      const currentSrc = audio.currentSrc || audio.src || "";
      if (!currentSrc) {
        console.warn("[unlock] skip: no currentSrc yet");
        return;
      }

      // Wait until the element can actually play current data (>= HAVE_CURRENT_DATA)
      if (audio.readyState < 2) {
        await new Promise((resolve) => {
          const onCanPlay = () => {
            audio.removeEventListener("canplay", onCanPlay);
            resolve();
          };
          audio.addEventListener("canplay", onCanPlay, { once: true });
        });
      }

      // Quick mime sanity
      const canPlay =
        audio.canPlayType("audio/mpeg") || audio.canPlayType("audio/mp3");
      if (!canPlay) {
        console.warn("[unlock] browser reports unsupported mime");
        return;
      }

      try {
        // Do NOT override el.src here; React controls it via props
        audio.muted = true;
        await audio.play(); // play under user gesture
        audio.pause(); // pause immediately; playback is now "unlocked"
        audio.muted = false;
        setAudioUnlocked(true);
        window.removeEventListener("pointerdown", onUnlock);
      } catch (err) {
        console.warn("[unlock] failed", err?.name || err, {
          currentSrc: audio.currentSrc,
          rs: audio.readyState,
        });
      }
    };

    // Use pointerdown (fires earlier than click) and ensure single-fire
    window.addEventListener("pointerdown", onUnlock, { once: true });

    return () => {
      window.removeEventListener("pointerdown", onUnlock);
    };
  }, [audioUnlocked, nowPlaying?.url]);

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
        {!audioUnlocked && nowPlaying?.url && (
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
              key={nowPlaying?.id || "empty"}
              ref={audioRef}
              src={nowPlaying?.url || ""}
              autoPlay={audioUnlocked && playerState?.status === "playing"} // only after unlock
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
