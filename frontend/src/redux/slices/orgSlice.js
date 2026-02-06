import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


const initialState = {
  organizations: [],
  loading: false,
  error: null,
};

// Async action to fetch organizations
export const fetchOrganizations = createAsyncThunk(
  'org/fetchOrganizations', async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:8080/api/organizations');
      const data = await response.json();
        if (!response.ok) {
            return rejectWithValue(data.error || 'Failed to fetch organizations');
        }
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const orgSlice = createSlice({
  name: 'org',
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
      });
  },
});

export default orgSlice.reducer;