import { useState, useEffect } from "react";
import { Box } from "@mantine/core";
import Sidebar from "./Sidebar";
import Header from "./Header";
import CreateOrg from "./CreateOrg";
import { useOrg } from "../redux/hooks/useOrg";
import { useProj } from "../redux/hooks/useProj";
import { Outlet } from "react-router-dom";

function App() {
  const { organizations, loading, loadOrganizations, selectedOrganization } =
    useOrg();
  const [showForcedOrgModal, setShowForcedOrgModal] = useState(false);
  const { loadProjects, clearAllProjects } = useProj();

  useEffect(() => {
    if (organizations.length === 0 && !loading) {
      loadOrganizations();
    }
  }, []);

  useEffect(() => {
    if (selectedOrganization) {
      clearAllProjects();
      loadProjects(selectedOrganization.id);
    }
  }, [selectedOrganization?.id, loadProjects, clearAllProjects]);

  useEffect(() => {
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
      <Sidebar />

      <Box className="flex-1 flex flex-col">
        <Header />

        <Outlet />
      </Box>

      {!loading && showForcedOrgModal && (
        <CreateOrg
          opened={showForcedOrgModal}
          onClose={() => {}}
          forced={true}
        />
      )}
    </Box>
  );
}

export default App;
