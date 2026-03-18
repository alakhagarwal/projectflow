import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../config/api";

const initialState = {
  tasks: [],
  loading: false,
  addLoading: false,
  error: null,
  addError: null,
  addedTask: null,
};

const TASK_STATUS_MAP = {
  TO_DO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  DONE: "COMPLETED",
};

const normalizeTask = (task) => {
  if (!task) return task;

  const normalizedStatus = TASK_STATUS_MAP[task.taskStatus] || task.taskStatus;
  return {
    ...task,
    status: normalizedStatus,
    priority: task.taskPriority,
    assigneeEmail: task.assignedToEmail,
    assigneeName: task.assignedToName,
    // Backward compatibility for current task table filters.
    assigneeId: task.assignedToEmail,
  };
};

export const createTask = createAsyncThunk(
  "task/createTask",
  async ({ projectId, taskData }, { rejectWithValue }) => {
    try {
      const data = await api.post(`/task/create/${projectId}`, taskData);
      return data;
    } catch (error) {
      return rejectWithValue(error || "Failed to create task");
    }
  },
);

export const fetchTasks = createAsyncThunk(
  "task/fetchTasks",
  async (projectId, { rejectWithValue }) => {
    try {
      const data = await api.get(`/task/fetch/${projectId}`);
      return data;
    } catch (error) {
      return rejectWithValue(error || "Failed to fetch tasks");
    }
  },
);

const taskSlice = createSlice({
  name: "task",
  initialState,
  reducers: {
    clearTaskState: (state) => {
      state.tasks = [];
      state.loading = false;
      state.addLoading = false;
      state.error = null;
      state.addError = null;
      state.addedTask = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTask.pending, (state) => {
        state.addLoading = true;
        state.addError = null;
        state.addedTask = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.addLoading = false;
        const normalizedTask = normalizeTask(action.payload);
        state.tasks.push(normalizedTask);
        state.addedTask = normalizedTask;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.addLoading = false;
        state.addError = action.payload || "Failed to create task";
      })
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = (action.payload || []).map(normalizeTask);
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearTaskState } = taskSlice.actions;
export default taskSlice.reducer;
