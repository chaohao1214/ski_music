import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiGet, apiPost } from "../../utils/apiClient";

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

export const fetchPlaylist = createAsyncThunk(
  "music/fetchPlaylist",
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiGet("/api/playlist");
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch playlist");
    }
  }
);

export const addSongToPlaylist = createAsyncThunk(
  "music/addSong",
  async (songId, { dispatch, rejectWithValue }) => {
    try {
      await apiPost("/api/playlist/add", { songId });
      dispatch(fetchPlaylist());
    } catch (error) {
      return rejectWithValue(error.message || "Failed to add song");
    }
  }
);

const initialState = {
  songLibrary: [],
  currentPlaylist: [],
  playerState: {},
  status: "idle",
  error: null,
};

const musicSlice = createSlice({
  name: "music",
  initialState,
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
      // cases for fetch playlist
      .addCase(fetchPlaylist.pending, (state) => {})
      .addCase(fetchPlaylist.fulfilled, (state, action) => {
        state.currentPlaylist = action.payload.playlist;
        state.playerState = action.payload.plater;
      })
      .addCase(fetchPlaylist.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(addSongToPlaylist.rejected, (state, action) => {
        console.error("Failed to add song:", action.payload);
        state.error = action.payload;
      });
  },
});

export default musicSlice.reducer;
