import { Center, MantineProvider } from "@mantine/core";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "@mantine/core/styles.css";
import "./App.css";
import { store } from "./redux/store.jsx";
import { Provider } from "react-redux";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Team from "./components/Team.jsx";
import Layout from "./components/Layout.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Projects from "./components/Projects.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true, // Default route at "/"
        element: <Dashboard />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "projects",
        element: <Projects />,
      },
      {
        path: "team",
        element: <Team />,
      },
      {
        path: "settings",
        element: <Center>Settings Page - Coming Soon!</Center>,
      },
    ],
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
  <MantineProvider>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </MantineProvider>,
);
