import { createSlice } from "@reduxjs/toolkit";
import { fetchPlaylist } from "./playlistSlice";

const initialState = {
  playerState: {
    currentSongId: null,
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
      const player = action.payload.player;
      console.log("player", player);

      state.playerState = player;
    });
  },
});

export const { setPlayerState } = playerSlice.actions;
export default playerSlice.reducer;
