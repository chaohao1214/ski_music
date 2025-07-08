import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import musicReducer from "../features/music/musicSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    music: musicReducer,
  },
});
