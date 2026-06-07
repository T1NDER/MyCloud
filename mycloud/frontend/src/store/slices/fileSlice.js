import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fileService } from "../../services/fileService";

export const fetchFiles = createAsyncThunk(
  "files/fetchFiles",
  async (userId, { rejectWithValue }) => {
    try {
      const files = await fileService.getFiles(userId);
      return files;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { error: "Ошибка получения файлов" },
      );
    }
  },
);

export const uploadFile = createAsyncThunk(
  "files/uploadFile",
  async ({ file, comment }, { rejectWithValue }) => {
    try {
      const response = await fileService.uploadFile(file, comment);
      return response.file;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { error: "Ошибка загрузки файла" },
      );
    }
  },
);

export const deleteFile = createAsyncThunk(
  "files/deleteFile",
  async (fileId, { rejectWithValue }) => {
    try {
      await fileService.deleteFile(fileId);
      return fileId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { error: "Ошибка удаления файла" },
      );
    }
  },
);

export const renameFile = createAsyncThunk(
  "files/renameFile",
  async ({ fileId, newName }, { rejectWithValue }) => {
    try {
      const response = await fileService.renameFile(fileId, newName);
      return response.file;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { error: "Ошибка переименования" },
      );
    }
  },
);

const fileSlice = createSlice({
  name: "files",
  initialState: {
    files: [],
    isLoading: false,
    error: null,
    uploadProgress: 0,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFiles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFiles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.files = action.payload;
      })
      .addCase(fetchFiles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(uploadFile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.files.unshift(action.payload);
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteFile.fulfilled, (state, action) => {
        state.files = state.files.filter((file) => file.id !== action.payload);
      })
      .addCase(deleteFile.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(renameFile.fulfilled, (state, action) => {
        const index = state.files.findIndex(
          (file) => file.id === action.payload.id,
        );
        if (index !== -1) {
          state.files[index] = action.payload;
        }
      })
      .addCase(renameFile.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearError } = fileSlice.actions;
export default fileSlice.reducer;
