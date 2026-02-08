import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

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
      const response = await fetch("http://localhost:8080/org/getAll", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      // Check if response has content
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        if (!response.ok) {
          return rejectWithValue(`Server error: ${response.status} ${response.statusText}`);
        }
        return rejectWithValue("Server returned non-JSON response");
      }
      
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.error || "Failed to fetch organizations");
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
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

      const response = await fetch("http://localhost:8080/org/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });
      
      // Check if response has content
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        if (!response.ok) {
          return rejectWithValue(`Server error: ${response.status} ${response.statusText}`);
        }
        return rejectWithValue("Server returned non-JSON response");
      }
      
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.error || "Failed to create organization");
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const orgSlice = createSlice({
  name: "org",
  initialState,
  reducers: {},
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

export default orgSlice.reducer;
