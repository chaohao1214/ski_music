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

export const changeUerRolesBulk = createAsyncThunk(
  "admin/changeRoleBulk",
  async (changes, { rejectWithValue }) => {
    try {
      const payload = {
        changes: changes.map((item) => ({ id: item.userId, role: item.role })),
      };
      return await apiPatch("/api/auth/roles-batch", payload);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to change role");
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
      .addCase(changeUerRolesBulk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(changeUerRolesBulk.fulfilled, (state, action) => {
        const updatedUsers = action.payload?.users ?? [];
        for (const updatedUser of updatedUsers) {
          const existingIndex = state.list.findIndex(
            (existingUser) => existingUser.id === updatedUser.id
          );
          if (existingIndex !== -1) {
            state.list[existingIndex] = updatedUser;
          } else {
            state.list.push(updatedUser);
          }
        }
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(changeUerRolesBulk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to change roles";
      });
  },
});

export default adminUserSlice.reducer;
