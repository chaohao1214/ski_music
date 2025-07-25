import { createSlice } from "@reduxjs/toolkit";
import { fetchPlaylist } from "./playlistSlice";

const initialState = {
  playerState: {
    currentSongId: -1,
    status: "stopped",
  },
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    setPlayerState(state, action) {
      state.playerState = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchPlaylist.fulfilled, (state, action) => {
      state.playerState = action.payload.player;
    });
  },
});

export const { setPlayerState } = playerSlice.actions;
export default playerSlice.reducer;
