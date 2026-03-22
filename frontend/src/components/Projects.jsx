import { useEffect, useState } from "react";
import {
  Box,
  Text,
  Button,
  Paper,
  Group,
  Badge,
  TextInput,
  Select,
  Loader,
  Alert,
  Tooltip,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import CreateProj from "./CreateProj";
import { useOrg } from "../redux/hooks/useOrg";
import { useProj } from "../redux/hooks/useProj";

// Icons
const SearchIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const PlusIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export default function Projects() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState(null);
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const { organizations, selectedOrganization } = useOrg();
  const { projects, loading, error } = useProj();
  const navigate = useNavigate();

  const isAdminInOrganization = () => {
    if (!selectedOrganization) return false;
    // Check various possible field names for role from the backend
    // The backend may return: userRole, organizationRole, role, or membership.role
    const role = selectedOrganization.userRole || selectedOrganization.organizationRole || selectedOrganization.role;
    return role && role.toUpperCase() === "ADMIN";
  };

  const statusOptions = [
    { value: "PLANNING", label: "Planning" },
    { value: "ACTIVE", label: "Active" },
    { value: "COMPLETED", label: "Completed" },
    { value: "ON_HOLD", label: "On Hold" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  const priorityOptions = [
    { value: "LOW", label: "Low" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HIGH", label: "High" },
  ];

  // Filter projects
  const filteredProjects = (projects || []).filter((project) => {
    const matchesSearch = project.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      !statusFilter || project.projectStatus === statusFilter;
    const matchesPriority =
      !priorityFilter || project.projectPriority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Status badge colors
  const getStatusColor = (status) => {
    const colors = {
      PLANNING: "gray",
      ACTIVE: "blue",
      COMPLETED: "green",
      ON_HOLD: "yellow",
      CANCELLED: "red",
    };
    return colors[status] || "gray";
  };

  // Priority text formatting
  const formatPriority = (priority) => {
    if (!priority) return "Not Set";
    return priority.charAt(0) + priority.slice(1).toLowerCase();
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Box p={30} className="flex-1 bg-slate-50 overflow-auto">
      {/* Header */}
      <Group justify="space-between" mb="xl">
        <Box>
          <Text size="2rem" fw={700} className="text-gray-900">
            Projects
          </Text>
          <Text size="sm" c="dimmed" mt={4}>
            Manage and track your projects
          </Text>
        </Box>
        <Tooltip 
          label="Only admins can create projects" 
          disabled={isAdminInOrganization()}
          position="bottom"
        >
          <Button
            leftSection={<PlusIcon />}
            size="md"
            className={isAdminInOrganization() ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-400 cursor-not-allowed"}
            onClick={() => setCreateModalOpened(true)}
            disabled={!isAdminInOrganization()}
          >
            New Project
          </Button>
        </Tooltip>
      </Group>

      {/* Search and Filters */}
      <Group mb="xl" gap="md">
        <TextInput
          placeholder="Search projects..."
          leftSection={<SearchIcon />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
          size="md"
          styles={{
            input: {
              border: "1px solid #e5e7eb",
              borderRadius: "0.5rem",
            },
          }}
        />
        <Select
          placeholder="All Status"
          data={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
          size="md"
          clearable
          styles={{
            input: {
              border: "1px solid #e5e7eb",
              borderRadius: "0.5rem",
              minWidth: "150px",
            },
          }}
        />
        <Select
          placeholder="All Priority"
          data={priorityOptions}
          value={priorityFilter}
          onChange={setPriorityFilter}
          size="md"
          clearable
          styles={{
            input: {
              border: "1px solid #e5e7eb",
              borderRadius: "0.5rem",
              minWidth: "150px",
            },
          }}
        />
      </Group>

      {/* Loading State */}
      {loading ? (
        <Box py={48} className="text-center">
          <Loader size="lg" />
          <Text size="sm" c="dimmed" mt="md">
            Loading projects...
          </Text>
        </Box>
      ) : error ? (
        /* Error State */
        <Alert color="red" title="Error Loading Projects">
          {error}
        </Alert>
      ) : (
        /* Projects Grid */
        <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <Paper
                key={project.id}
                p="lg"
                radius="lg"
                className="border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                {/* Project Name */}
                <Text size="lg" fw={600} mb={4} className="text-gray-900">
                  {project.name}
                </Text>

                {/* Description */}
                <Text
                  size="sm"
                  c="dimmed"
                  mb="md"
                  lineClamp={2}
                  style={{ minHeight: "40px" }}
                >
                  {project.description || "No description"}
                </Text>

                {/* Status and Priority */}
                <Group justify="space-between" mb="md">
                  <Badge
                    color={getStatusColor(project.projectStatus)}
                    variant="light"
                    size="lg"
                  >
                    {project.projectStatus || "NO STATUS"}
                  </Badge>
                  <Text size="sm" c="dimmed">
                    {formatPriority(project.projectPriority)}
                  </Text>
                </Group>

                {/* Project Dates */}
                <Box
                  style={{
                    backgroundColor: "#f8fafc",
                    padding: "8px 12px",
                    borderRadius: "6px",
                  }}
                >
                  <Group justify="space-between" mb={4}>
                    <Text size="xs" c="dimmed">
                      Start Date
                    </Text>
                    <Text size="xs" fw={500}>
                      {formatDate(project.startDate)}
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">
                      End Date
                    </Text>
                    <Text size="xs" fw={500}>
                      {formatDate(project.endDate)}
                    </Text>
                  </Group>
                </Box>

                {/* Team Lead */}
                <Box mt="sm">
                  <Text size="xs" c="dimmed">
                    Team Lead: {project.teamLeadEmail}
                  </Text>
                </Box>
              </Paper>
            ))
          ) : (
            <Box py={48} className="col-span-full text-center">
              <Text size="lg" c="dimmed">
                No projects found
              </Text>
              <Text size="sm" c="dimmed" mt={4}>
                {searchQuery || statusFilter || priorityFilter
                  ? "Try adjusting your filters"
                  : "Create your first project to get started"}
              </Text>
            </Box>
          )}
        </Box>
      )}

      {/* Create Project Modal */}
      <CreateProj
        opened={createModalOpened}
        onClose={() => setCreateModalOpened(false)}
      />
    </Box>
  );
}
