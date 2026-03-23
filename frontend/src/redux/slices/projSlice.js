import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../config/api"; 

const initialState = {
  projects: [],
  loading: false,
  error: null,
  currentOrgId: null,
  updateLoading: false,
  updateError: null,
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


export const createProject = createAsyncThunk(
  "projects/createProject",
  async ({ organizationId, name, description, projectStatus, projectPriority,startDate,endDate,teamLeadEmail }, { rejectWithValue }) => {
    try {
      const data = await api.post("/proj/create", {
        organizationId,
        name,
        description,
        projectStatus,
        projectPriority,
        startDate,
        endDate,
        teamLeadEmail
      });
      return data;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const updateProject = createAsyncThunk(
  "projects/updateProject",
  async ({ projectId, name, description, projectStatus, projectPriority, startDate, endDate }, { rejectWithValue }) => {
    try {
      const data = await api.put(`/proj/${projectId}`, {
        name,
        description,
        projectStatus,
        projectPriority,
        startDate,
        endDate,
      });
      return data;
    } catch (error) {
      return rejectWithValue(error);
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
      })
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects.push(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateProject.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.projects.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      });
  },
});

export const { clearProjects } = projSlice.actions;
export default projSlice.reducer;