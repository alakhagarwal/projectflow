import { useState, useEffect } from "react";
import { Box } from "@mantine/core";
import Sidebar from "./Sidebar";
import Header from "./Header";
import CreateOrg from "./CreateOrg";
import { useOrg } from "../redux/hooks/useOrg";
import { Outlet } from "react-router-dom";

function App() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const { organizations, loading, loadOrganizations } = useOrg();
  const [showForcedOrgModal, setShowForcedOrgModal] = useState(false);

  useEffect(() => {
    if (!loading && organizations.length === 0) {
      loadOrganizations();
    }
  }, []); // Keep empty deps - runs once on mount

  useEffect(() => {
    // After loading completes, check if user has no organizations
    if (!loading && organizations.length === 0) {
      setShowForcedOrgModal(true);
    } else if (organizations.length > 0) {
      setShowForcedOrgModal(false);
    }
  }, [loading, organizations]);

  return (
    <Box
      className="flex h-screen bg-slate-50"
      style={{ filter: showForcedOrgModal ? "blur(8px)" : "none" }}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <Box className="flex-1 flex flex-col">
        {/* Header */}
        <Header />

        {/* Dashboard Content */}
        <Outlet />
      </Box>

      {/* Forced Organization Creation Modal */}
      <CreateOrg
        opened={showForcedOrgModal}
        onClose={() => {}}
        forced={true}
        onSuccess={() => loadOrganizations()}
      />
    </Box>
  );
}

export default App;
