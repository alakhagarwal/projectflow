import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../config/api";

const initialState = {
  members: [],
  loading: false,
  error: null,
  addError: null,
  addedMember: null,
};

export const addProjectMember = createAsyncThunk(
  "projectMember/addProjectMember",
  async ({ projectId, email, projectRole }, { rejectWithValue }) => {
    try {
      const payload = {
        email,
      };

      if (projectRole) {
        payload.projectRole = projectRole;
      }

      const data = await api.post(`/proj/${projectId}/members`, payload);
      return data;
    } catch (error) {
      return rejectWithValue(error || "Failed to add project member");
    }
  },
);

export const fetchProjectMembers = createAsyncThunk(
  "projectMember/fetchProjectMembers",
  async (projectId, { rejectWithValue }) => {
    try {
      const data = await api.get(`/proj/${projectId}/members`);
      return data;
    } catch (error) {
      return rejectWithValue(error || "Failed to fetch project members");
    }
  },
);

const projMemberSlice = createSlice({
  name: "projectMember",
  initialState,
  reducers: {
    clearProjectMembersState: (state) => {
      state.members = [];
      state.loading = false;
      state.error = null;
      state.addError = null;
      state.addedMember = null;
    },
    clearAddedProjectMember: (state) => {
      state.addedMember = null;
      state.addError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addProjectMember.pending, (state) => {
        state.loading = true;
        state.addError = null;
      })
      .addCase(addProjectMember.fulfilled, (state, action) => {
        state.loading = false;
        state.addedMember = action.payload;

        const addedUserId = action.payload?.userId;
        const alreadyExists = state.members.some(
          (member) => member.userId === addedUserId,
        );

        if (!alreadyExists) {
          state.members.push(action.payload);
        }
      })
      .addCase(addProjectMember.rejected, (state, action) => {
        state.loading = false;
        state.addError = action.payload || "Failed to add project member";
      })
      .addCase(fetchProjectMembers.fulfilled, (state, action) => {
        state.members = action.payload;
      })
      .addCase(fetchProjectMembers.rejected, (state, action) => {
        state.error = action.payload || "Failed to fetch project members";
      })
      .addCase(fetchProjectMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      });
  },
});

export const { clearProjectMembersState, clearAddedProjectMember } =
  projMemberSlice.actions;
export default projMemberSlice.reducer;
