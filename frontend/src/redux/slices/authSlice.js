import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../config/api"; // Import our custom API utility

const initialState = {
  token: localStorage.getItem("token") || null,
  // ☝️ On page load, check if token exists in localStorage (for refresh)

  email: null,
  // ☝️ Will be set after login

  isAuthenticated: !!localStorage.getItem("token"),
  // ☝️ Double bang (!!) converts to boolean: "some-token" → true, null → false

  loading: false,
  // ☝️ Shows loading spinner in UI

  error: null,
  // ☝️ Shows error message in UI

  // Register state
  registerLoading: false,
  registerError: null,
  fullName: null,
  registerSuccess: false, // To show success message

  isValidating: false, // Shows loading during validation
  validationChecked: false, // Tracks if we've checked the token

  updateProfileLoading: false,
  updateProfileError: null,
  updateProfileSuccess: false,

  // we dont have to show any error message on initial load or while
};

// Add this BEFORE the createSlice
export const validateToken = createAsyncThunk(
  "auth/validateToken",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return rejectWithValue("No token found");
      }

      const data = await api.get("/auth/validate-token");

      return {
        email: data.email,
        fullName: data.fullName,
        token: token,
      };
    } catch (error) {
      localStorage.removeItem("token");
      return rejectWithValue(error);
    }
  },
);

// jaha pe jo return hoga wo payload me aayega
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const data = await api.post("/auth/register", userData);
      return data;
    } catch (error) {
      return rejectWithValue(error); // That's it! ✅
    }
  },
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      // ✨ No manual JSON parsing, no response.ok check, no headers!
      const data = await api.post("/generate-token", credentials);

      localStorage.setItem("token", data.token);

      return {
        token: data.token,
        email: data.email || credentials.email,
        fullName: data.fullName, // ← Capture fullName from API response
      };
    } catch (error) {
      return rejectWithValue(error); // error is already transformed by api.js interceptor
    }
  },
);

// {
//   type: "auth/login/rejected",
//   payload: "Invalid email or password",  // ← From rejectWithValue
//   meta: { rejectedWithValue: true }
// }

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (userData, { rejectWithValue }) => {
    try {
      const data = await api.put("/auth/update-profile", userData);
      return data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  // Synchronous action: logout
  reducers: {
    logout: (state) => {
      state.token = null;
      state.email = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem("token");
    },
    // Synchronous action: clear error
    clearError: (state) => {
      state.error = null;
    },
    clearRegisterError: (state) => {
      state.registerError = null;
    },

    resetRegisterState: (state) => {
      state.registerLoading = false;
      state.registerError = null;
      state.registerSuccess = false;
    },
    resetUpdateProfileState: (state) => {
      state.updateProfileLoading = false;
      state.updateProfileError = null;
      state.updateProfileSuccess = false;
    },
  },
  // Handle async actions in extraReducers
  extraReducers: (builder) => {
    // Login cases (already there)
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.fullName = action.payload.fullName; // Set fullName on login success
        state.token = action.payload.token;
        state.email = action.payload.email;
        state.isAuthenticated = true;
        state.validationChecked = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
        state.isAuthenticated = false;
        state.validationChecked = true;
      })

      .addCase(registerUser.pending, (state) => {
        state.registerLoading = true;
        state.registerError = null;
        state.registerSuccess = false;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.registerLoading = false;
        state.registerSuccess = true;
        state.registerError = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.registerLoading = false;
        state.registerError = action.payload || ["Registration failed"];
        state.registerSuccess = false;
      })
      .addCase(validateToken.pending, (state) => {
        state.isValidating = true;
        state.error = null;
      })
      .addCase(validateToken.fulfilled, (state, action) => {
        state.isValidating = false;
        state.validationChecked = true;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.email = action.payload.email;
        state.fullName = action.payload.fullName;
      })
      .addCase(validateToken.rejected, (state) => {
        state.isValidating = false;
        state.validationChecked = true;
        state.isAuthenticated = false;
        state.token = null;
        state.email = null;
        state.fullName = null;
      })
      .addCase(updateProfile.pending, (state) => {
        state.updateProfileLoading = true;
        state.updateProfileError = null;
        state.updateProfileSuccess = false;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updateProfileLoading = false;
        state.updateProfileSuccess = true;
        state.fullName = action.payload.firstName + (action.payload.lastName ? " " + action.payload.lastName : "");
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updateProfileLoading = false;
        state.updateProfileError = action.payload || "Failed to update profile";
      });
  },
});

export const { logout, clearError, clearRegisterError, resetRegisterState, resetUpdateProfileState } =
  authSlice.actions;
export default authSlice.reducer;
