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
  playerState: {
    currentSongId: null,
    status: "stopped",
  },
};
const playlistSlice = createSlice({
  name: "playlist",
  initialState,
  reducers: {
    updatePlayerAndPlaylist(state, action) {
      const { playlist, player } = action.payload;
      state.currentPlaylist = playlist;
      state.playerState = player;
    },
    updatePlaylistOrder(state, action) {
      state.currentPlaylist = action.payload;
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
        const { playlist, player } = action.payload || {};

        if (Array.isArray(playlist)) {
          state.currentPlaylist = playlist;
        } else {
          console.warn("Invalid playlist data from fetch:", action.payload);
          state.currentPlaylist = [];
        }
        if (player) {
          state.playerState = player;
        } else {
          console.warn("Invalid player data from fetch:", action.payload);
          state.playerState = {
            currentSongId: null,
            status: "stopped",
          };
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

export const {
  setPlaylistState,
  updatePlayerAndPlaylist,
  updatePlaylistOrder,
} = playlistSlice.actions;

export default playlistSlice.reducer;
