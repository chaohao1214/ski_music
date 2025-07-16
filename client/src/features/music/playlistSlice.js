import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiDelete, apiGet, apiPost } from "../../utils/apiClient";

export const fetchPlaylist = createAsyncThunk(
  "music/fetchPlaylist",
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiGet("/api/player/state");
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch playlist");
    }
  }
);

export const addSongToPlaylist = createAsyncThunk(
  "music/addSong",
  async (songId, { rejectWithValue }) => {
    try {
      await apiPost("/api/playlist/add", { songId });
    } catch (error) {
      return rejectWithValue(error.message || "Failed to add song");
    }
  }
);

export const removeSongFromPlaylist = createAsyncThunk(
  "music/removeSongFromPlaylist",
  async (playlistItemId, { rejectWithValue }) => {
    try {
      await apiDelete(`/api/playlist/remove/${playlistItemId}`);
      return playlistItemId;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to remove song");
    }
  }
);

const initialState = {
  currentPlaylist: [],
  status: "idle",
  error: null,
};

const playlistSlice = createSlice({
  name: "playlist",
  initialState,
  reducers: {
    setPlaylistState: (state, action) => {
      state.currentPlaylist = action.payload.playlist;
    },
    updatePlaylistFromSocket(state, action) {
      state.currentPlaylist = action.payload.playlist;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlaylist.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPlaylist.fulfilled, (state, action) => {
        state.currentPlaylist = action.payload.playlist;
      })
      .addCase(fetchPlaylist.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(addSongToPlaylist.rejected, (state, action) => {
        console.error("Failed to add song:", action.payload);
        state.error = action.payload;
      })
      .addCase(removeSongFromPlaylist.fulfilled, (state, action) => {
        state.currentPlaylist = state.currentPlaylist.filter(
          (song) => song.playlistItemId !== action.payload
        );
      });
  },
});

export const { setPlaylistState, updatePlaylistFromSocket } =
  playlistSlice.actions;

export default playlistSlice.reducer;
