import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import songLibraryReducer from "../features/music/songLibrarySlice";
import playlistReducer from "../features/music/playlistSlice";
import playerReducer from "../features/music/playerSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    songs: songLibraryReducer,
    playlist: playlistReducer,
    player: playerReducer,
  },
});
