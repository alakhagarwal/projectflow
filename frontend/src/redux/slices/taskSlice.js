import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../config/api";

const initialState = {
  tasks: [],
  loading: false,
  error: null,
  addError: null,
  addedTask: null,
};

export const createTask = createAsyncThunk(
  "task/createTask",
  async ({ projectId, taskData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/task/create/${projectId}`, taskData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const fetchTasks = createAsyncThunk(
  "task/fetchTasks",
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/task/fetch/${projectId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

const taskSlice = createSlice({
  name: "task",
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(createTask.pending, (state) => {
        state.addError = null;
        state.addedTask = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload);
        state.addedTask = action.payload;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.addError = action.payload || "Failed to create task";
      })
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default taskSlice.reducer;
