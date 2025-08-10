import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiGet, apiPatch } from "../../utils/apiClient";

export const fetchAllUsers = createAsyncThunk(
  "adminUsers/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await apiGet("/api/auth");
    } catch (error) {
      return rejectWithValue(e.message || "Failed to load users");
    }
  }
);

export const changeUerRole = createAsyncThunk(
  "admin/changeRole",
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      return await apiPatch(`api/auth/${userId}/role`, { role });
    } catch (error) {
      return rejectWithValue(e.message || "Failed to change role");
    }
  }
);

const adminUserSlice = createSlice({
  name: "adminUser",
  initialState: { list: [], status: "idle", error: null },
  reducers: {},
  extraReducers: (build) => {
    build
      .addCase(fetchAllUsers.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(changeUerRole.fulfilled, (state, action) => {
        const updated = action.payload;
        const id = state.list.findIndex((user) => user.id === updated.id);
        if (id !== -1) state.list[id] = updated;
      });
  },
});

export default adminUserSlice.reducer;
