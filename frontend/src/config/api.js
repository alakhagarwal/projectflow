import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Maximum time to wait for a response (10 seconds)
});


// FormData (file upload) - Axios auto-detects and changes header!
// const formData = new FormData();
// formData.append('logo', file);
// api.post('/org/create', formData);
// Axios automatically changes to: "Content-Type": "multipart/form-data"

// 🔥 Request Interceptor - Adds token to EVERY request automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    } 
    return config;
  },
  //// Example: Network is offline before request even starts
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response.data; // Return only the data part of the response
  },
  (error) => {
     // Transform error into consistent format
    const message = error.response?.data?.error 
      || error.response?.data?.message 
      || error.message 
      || 'Network error';
    
    return Promise.reject(message);
    // This will be caught in authSlice and passed to rejectWithValue, which will set it as the error state.
  }
);

export default api;
