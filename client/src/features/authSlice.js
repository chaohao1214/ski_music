import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiPost, setAuthToken } from "../utils/apiClient";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await apiPost("/api/auth/login", credentials);
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    // get token from localstorage to handle page refersh
    token: localStorage.getItem("token") || null,
    isAuthenticated: !!localStorage.getItem("token"),
    status: "idle",
    error: null,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem("token");
      setAuthToken(null);
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    clearError: (state) => {
      state.error = null;
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { id, username, token } = action.payload;
        state.user = { id, username };
        state.token = token;
        state.isAuthenticated = true;

        //persist token and set it for future api call
        localStorage.setItem("token", token);
        setAuthToken(token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        localStorage.removeItem("token");
      });
  },
});

export const { logout, clearError } = authSlice.actions;

export default authSlice.reducer;
