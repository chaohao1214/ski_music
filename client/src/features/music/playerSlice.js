import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { enqueueSnackbar } from "notistack";
import { apiPost } from "../../utils/apiClient";

export const sendPlayerCommand = createAsyncThunk(
  "player/sendCommand",
  async ({ action, songId = null }, { rejectWithValue }) => {
    try {
      const playload = { action };
      if (songId) {
        playload.songId = songId;
      }
      const response = await apiPost("/api/player/action", playload);
      enqueueSnackbar(`🎵 ${action} success`, { variant: "success" });
      return response.data;
    } catch (error) {
      enqueueSnackbar(`❌ Failed to ${action}`, { variant: "error" });
      return rejectWithValue(error.message || "Command failed");
    }
  }
);

const initialState = {
  playerState: {
    currentSongId: null,
    status: "stopped",
  },
  loading: false,
  error: null,
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    setPlayerState: (state, action) => {
      state.playerState = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendPlayerCommand.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendPlayerCommand.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendPlayerCommand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setPlayerState } = playerSlice.actions;
export default playerSlice.reducer;
