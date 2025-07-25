import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiDelete, apiGet, apiPost } from "../../utils/apiClient";

export const fetchPlaylist = createAsyncThunk(
  "playlist/fetchPlaylist",
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
  "playlist/addSong",
  async (songId, { rejectWithValue }) => {
    try {
      const addedSong = await apiPost("/api/playlist/add", { songId });
      return addedSong;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to add song");
    }
  }
);

export const removeSongFromPlaylist = createAsyncThunk(
  "playlist/removeSongFromPlaylist",
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
    updatePlaylistFromSocket(state, action) {
      const { playlist } = action.payload || {};
      if (Array.isArray(playlist)) {
        const unique = [];
        const seen = new Set();
        for (const song of playlist) {
          if (!seen.has(song.playlistItemId)) {
            seen.add(song.playlistItemId);
            unique.push(song);
          }
        }
        state.currentPlaylist = unique;
      } else {
        console.warn("Invalid playlist data from socket:", action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addSongToPlaylist.fulfilled, (state, action) => {
        const newSong = action.payload;
        if (newSong && newSong.playlistItemId) {
          const exists = state.currentPlaylist.some(
            (song) => song.playlistItemId === newSong.playlistItemId
          );
          if (exists) {
            state.currentPlaylist.push(newSong);
          }
        } else {
          console.warn("No song returned from addSongToPlaylist");
        }
      })
      .addCase(addSongToPlaylist.rejected, (state, action) => {
        console.error("Failed to add song:", action.payload);
        state.error = action.payload;
      })

      .addCase(fetchPlaylist.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPlaylist.fulfilled, (state, action) => {
        console.log("🎯 fetchPlaylist response:", action.payload);
        const { playlist } = action.payload || {};

        if (Array.isArray(playlist)) {
          state.currentPlaylist = playlist;
        } else {
          console.warn("Invalid playlist data from fetch:", action.payload);
          state.currentPlaylist = [];
        }
        state.status = "succeeded";
      })

      .addCase(fetchPlaylist.rejected, (state, action) => {
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
