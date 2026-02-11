import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  projects: [],
  loading: false,
  error: null,
};