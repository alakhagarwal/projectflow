import { useState } from "react";
import "./App.css";
import { Box } from "@mantine/core";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";

function App() {
  const [activeNav, setActiveNav] = useState("dashboard");

  return (
    <Box className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />

      {/* Main Content */}
      <Box className="flex-1 flex flex-col">
        {/* Header */}
        <Header userName="Alakh Agarwal" />

        {/* Dashboard Content */}
        <Dashboard userName="Alakh Agarwal" orgName="Org1" />
      </Box>
    </Box>
  );
}

export default App;
