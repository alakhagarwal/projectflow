import { useState, useEffect } from "react";
import "./App.css";
import { Box } from "@mantine/core";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import CreateOrg from "./components/CreateOrg";
import { useAuth } from "./redux/hooks/useAuth";
import { useOrg } from "./redux/hooks/useOrg";

function App() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const fullName = useAuth().fullName;
  const { organizations, loading, loadOrganizations } = useOrg();
  const [showForcedOrgModal, setShowForcedOrgModal] = useState(false);

  useEffect(() => {
    loadOrganizations();
  }, []);

  useEffect(() => {
    // After loading completes, check if user has no organizations
    if (!loading && organizations.length === 0) {
      setShowForcedOrgModal(true);
    } else if (organizations.length > 0) {
      setShowForcedOrgModal(false);
    }
  }, [loading, organizations]);

  return (
    <Box className="flex h-screen bg-slate-50" style={{ filter: showForcedOrgModal ? 'blur(8px)' : 'none' }}>
      {/* Sidebar */}
      <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />

      {/* Main Content */}
      <Box className="flex-1 flex flex-col">
        {/* Header */}
        <Header userName="Alakh Agarwal" />

        {/* Dashboard Content */}
        <Dashboard/>
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
