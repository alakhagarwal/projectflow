import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../config/api"; 

const initialState = {
  projects: [],
  loading: false,
  error: null,
};

export const fetchProjects = createAsyncThunk(
  "projects/fetchProjects",
  async (organizationId, { rejectWithValue }) => {
    try {
      const data = await api.get(`/proj/getAll/${organizationId}`);
      return data;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
  // Add a condition to prevent multiple simultaneous fetches
  {
    condition: (organizationId, { getState }) => {
      const { proj } = getState();
      return !proj.loading;
    }
  },
);

const projSlice = createSlice({
  name: "proj",
  initialState, 
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setLoading } = projSlice.actions;
export default projSlice.reducer;