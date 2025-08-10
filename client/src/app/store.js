import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import songLibraryReducer from "../features/music/songLibrarySlice";
import playlistReducer from "../features/music/playlistSlice";
import playerReducer from "../features/music/playerSlice";
import adminUserReducer from "../features/admin/usersSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminUserReducer,
    songs: songLibraryReducer,
    playlist: playlistReducer,
    player: playerReducer,
  },
});
