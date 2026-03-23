import { Center, MantineProvider, createTheme } from "@mantine/core";
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
import ProjectDetails from "./components/ProjectDetails.jsx";
import AcceptInvite from "./components/AcceptInvite.jsx";
import { Notifications } from "@mantine/notifications";

const theme = createTheme({
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  primaryColor: "indigo",
  defaultRadius: "md",
  shadows: {
    xs: "0 1px 2px rgba(0, 0, 0, 0.04)",
    sm: "0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
  },
  components: {
    Button: {
      defaultProps: {
        radius: "md",
      },
      styles: {
        root: {
          fontWeight: 600,
          transition: "all 0.15s ease",
        },
      },
    },
    Paper: {
      defaultProps: {
        radius: "lg",
      },
      styles: {
        root: {
          transition: "box-shadow 0.2s ease, transform 0.2s ease",
        },
      },
    },
    TextInput: {
      defaultProps: {
        radius: "md",
      },
    },
    Modal: {
      defaultProps: {
        radius: "lg",
        centered: true,
      },
      styles: {
        title: {
          fontWeight: 600,
        },
      },
    },
    Badge: {
      styles: {
        root: {
          textTransform: "capitalize",
          fontWeight: 600,
        },
      },
    },
  },
});

import LandingPage from "./components/LandingPage.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
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
        path: "projects/:projectId",
        element: <ProjectDetails />,
      },
      {
        path: "team",
        element: <Team />,
      },
      {
        path: "settings",
        element: <Center>Settings Page - Coming Soon!</Center>,
      }
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
  {
    path: "/accept-invite",
    element: <AcceptInvite />,
  },
]);

createRoot(document.getElementById("root")).render(
  <MantineProvider theme={theme}>
    <Notifications position="top-right" />
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </MantineProvider>,
);
