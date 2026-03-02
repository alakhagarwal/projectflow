import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../config/api";

const initialState = {
  members: [],
  loading: false,
  error: null,
  inviteError: null
};

export const fetchMembers = createAsyncThunk(
  "team/fetchMembers",
  async (orgId, { rejectWithValue }) => {
    try {
      const data = await api.get(`/org/${orgId}/members`);
      console.log("Fetched members:", data);
      return data;
    } catch (error) {
      return rejectWithValue(error || "Failed to fetch members");
    }
  },
  {
    condition: (orgId, { getState }) => {
      const { team } = getState();
      return !team.loading; // Skip if already loading
    },
  },
);

export const inviteMember = createAsyncThunk(
  "team/inviteMember",
  async ({ orgId, email, role }, { rejectWithValue }) => {
    try {
      const data = await api.post(`/org/${orgId}/invite`, { email, role });
      return data;
    } catch (error) {
      return rejectWithValue(error || "Failed to invite member");
    }
  },
);



const memberSlice = createSlice({
  name: "team",
  initialState,
  reducers: {
    clearMembers: (state) => {
      state.members = [];
      state.loading = false;
      state.error = null;
      state.inviteError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload;
      })
      .addCase(fetchMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch members";
      })
      .addCase(inviteMember.pending, (state) => {
        state.loading = true;
        state.inviteError = null;
      })
      .addCase(inviteMember.fulfilled, (state, action) => {
        state.loading = false;
        // we wont add to the list because the invited member has not accepted the invite yet, so we will refetch the members list when the modal is closed
      })
      .addCase(inviteMember.rejected, (state, action) => {
        state.loading = false;
        state.inviteError = action.payload || "Failed to invite member";
      });
  },
});


export const { clearMembers } = memberSlice.actions;
export default memberSlice.reducer;
