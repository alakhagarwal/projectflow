import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../config/api";

const initialState = {
  members: [],
  loading: false,
  error: null,
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

const memberSlice = createSlice({
  name: "team",
  initialState,
  reducers: {
    clearMembers: (state) => {
      state.members = [];
      state.loading = false;
      state.error = null;
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
      });
  },
});


export const { clearMembers } = memberSlice.actions;
export default memberSlice.reducer;
