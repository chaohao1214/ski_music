import React, { useEffect } from "react";
import { useSocket } from "../contexts/SocketContext";
import { updatePlayerAndPlaylist } from "../features/music/playlistSlice";
import { SOCKET_EVENTS } from "../utils/socketEvent";

export function usePlayerSocket(dispatch, audioRef, audioUnlocked, nowPlaying) {
  const socket = useSocket();

  useEffect(() => {
    socket.connect();

    // Handle playlist state updates
    const handlePlaylistUpdate = (newState) => {
      dispatch(updatePlayerAndPlaylist(newState));
    };

    // Handle player control commands
    const handleExecuteCommand = (data) => {
      const audio = audioRef.current?.audio?.current;
      if (!audio) return;

      switch (data.action) {
        case "PLAY":
          if (audioUnlocked && nowPlaying?.url) {
            audio.src = nowPlaying.url;
            audio.play().catch(() => {});
          }
          break;
        case "PAUSE":
          audio.pause();
          break;
        case "RESUME":
          if (audioUnlocked) audio.play().catch(() => {});
          break;
        case "STOP":
          audio.pause();
          audio.currentTime = 0;
          break;
        default:
          break;
      }
    };

    socket.on(SOCKET_EVENTS.STATE_UPDATE, handlePlaylistUpdate);
    socket.on(SOCKET_EVENTS.EXECUTE, handleExecuteCommand);

    // Request initial state
    socket.emit("playlist:get_state");

    return () => {
      socket.off(SOCKET_EVENTS.STATE_UPDATE, handlePlaylistUpdate);
      socket.off(SOCKET_EVENTS.EXECUTE, handleExecuteCommand);
      socket.disconnect();
    };
  }, [socket, dispatch, audioRef, audioUnlocked, nowPlaying?.id]);
  return socket;
}
