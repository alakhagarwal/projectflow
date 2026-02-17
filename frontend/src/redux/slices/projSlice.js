import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../config/api"; 

const initialState = {
  projects: [],
  loading: false,
  error: null,
  currentOrgId: null,
};

export const fetchProjects = createAsyncThunk(
  "projects/fetchProjects",
  async (organizationId, { rejectWithValue }) => {
    try {
      const data = await api.get(`/proj/getAll/${organizationId}`);
      return { data, organizationId };
    } catch (error) {
      return rejectWithValue(error);
    }
  },
  // Prevent duplicate fetches for the SAME org, but allow switching orgs
  {
    condition: (organizationId, { getState }) => {
      const { proj } = getState();
      // Only skip if SAME org is already loading
      if (proj.loading && proj.currentOrgId === organizationId) {
        return false;
      }
      return true;
    }
  },
);

const projSlice = createSlice({
  name: "proj",
  initialState, 
  reducers: {
    clearProjects: (state) => {
      state.projects = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.currentOrgId = action.meta.arg;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload.data;
        state.currentOrgId = action.payload.organizationId;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentOrgId = null;
      });
  },
});

export const { clearProjects } = projSlice.actions;
export default projSlice.reducer;