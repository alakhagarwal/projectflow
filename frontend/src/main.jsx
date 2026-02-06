import { StrictMode } from "react";
import { MantineProvider } from "@mantine/core";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import "@mantine/core/styles.css";
import { store } from "./redux/store.jsx";
import { Provider } from "react-redux";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MantineProvider>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </MantineProvider>
  </StrictMode>,
);
