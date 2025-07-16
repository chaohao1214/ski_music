import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiGet, apiDelete } from "../../utils/apiClient";

// 🎵 Fetch Song Library
export const fetchSongLibrary = createAsyncThunk(
  "music/fetchLibrary",
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiGet("/api/songs");
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch song library");
    }
  }
);

// ❌ Delete Song
export const deleteSongFromLibrary = createAsyncThunk(
  "music/deleteSongFromLibrary",
  async (songId, { rejectWithValue }) => {
    try {
      await apiDelete(`/api/songs/${songId}`);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete song");
    }
  }
);

const songSlice = createSlice({
  name: "songs",
  initialState: {
    songLibrary: [],
    error: null,
    status: "idle",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSongLibrary.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSongLibrary.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.songLibrary = action.payload;
      })
      .addCase(fetchSongLibrary.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(deleteSongFromLibrary.fulfilled, (state, action) => {
        state.songLibrary = state.songLibrary.filter(
          (song) => song.id !== action.payload
        );
      });
  },
});

export default songSlice.reducer;
