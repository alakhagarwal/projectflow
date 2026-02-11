import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
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
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  //// Example: Network is offline before request even starts
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    return response.data; // Return only the data part of the response
  },
  (error) => {
    if (
      error.response?.data?.errors &&
      typeof error.response.data.errors === "object"
    ) {
      // Extract all error messages from the object
      const errorMessages = Object.values(error.response.data.errors);
      // errorMessages = ["Email must be valid", "Password must be at least 8 characters"]

      // Join them with ". " separator
      const errorMessage = errorMessages.join(". ");
      // errorMessage = "Email must be valid. Password must be at least 8 characters"

      return Promise.reject(errorMessage);
    }

    // Existing code for single error messages
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Network error";

    return Promise.reject(message);
  },
);

export default api;
