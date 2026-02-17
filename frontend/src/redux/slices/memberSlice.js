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
