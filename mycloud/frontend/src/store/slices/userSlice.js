import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { userService } from "../../services/userService";

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const users = await userService.getUsers();
      return users;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          error: "Ошибка получения списка пользователей",
        },
      );
    }
  },
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (userId, { rejectWithValue }) => {
    try {
      await userService.deleteUser(userId);
      return userId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { error: "Ошибка удаления пользователя" },
      );
    }
  },
);

export const toggleAdmin = createAsyncThunk(
  "users/toggleAdmin",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userService.toggleAdmin(userId);
      return response.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { error: "Ошибка изменения статуса" },
      );
    }
  },
);

const userSlice = createSlice({
  name: "users",
  initialState: {
    users: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((user) => user.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(toggleAdmin.fulfilled, (state, action) => {
        const index = state.users.findIndex(
          (user) => user.id === action.payload.id,
        );
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(toggleAdmin.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;
