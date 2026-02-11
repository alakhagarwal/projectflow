import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../config/api"; // Import our custom API utility

const initialState = {
  organizations: [],
  loading: false,
  error: null,
};

// Async action to fetch organizations
export const fetchOrganizations = createAsyncThunk(
  "org/fetchOrganizations",
  async (_, { rejectWithValue }) => {
    try {
      const data = await api.get("/org/getAll");
      return data;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
  {
    condition: (_, { getState }) => {
      const { org } = getState();
      return !org.loading; // Skip if already loading
    },
  },
);

// Async action to create organization
export const createOrganization = createAsyncThunk(
  "org/createOrganization",
  async ({ name, slug, logo }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("slug", slug);
      if (logo) {
        formData.append("logo", logo);
      }

      const data = await api.post("/org/create", formData);
      return data;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

const orgSlice = createSlice({
  name: "org",
  initialState,
  reducers: {
    clearOrganizations: (state) => {
      state.organizations = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrganizations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrganizations.fulfilled, (state, action) => {
        state.loading = false;
        state.organizations = action.payload;
      })
      .addCase(fetchOrganizations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrganization.fulfilled, (state, action) => {
        state.loading = false;
        state.organizations.push(action.payload);
      })
      .addCase(createOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearOrganizations } = orgSlice.actions;

export default orgSlice.reducer;
