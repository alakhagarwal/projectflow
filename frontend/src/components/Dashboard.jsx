import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Text, Button, Paper, Group, Badge, Alert, Tooltip } from "@mantine/core";
import StatsCard from "./StatsCard";
import { useAuth } from "../redux/hooks/useAuth";
import { useProj } from "../redux/hooks/useProj";
import { useOrg } from "../redux/hooks/useOrg";
import { useTask } from "../redux/hooks/useTask";

// Icons
const FolderIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="M22 4L12 14.01l-3-3" />
  </svg>
);

const UsersIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const AlertIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
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

const ArrowRightIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const PersonIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export default function Dashboard() {
  const { fullName, isValidating } = useAuth();
  const { projects, loading, error } = useProj();
  const { selectedOrganization } = useOrg();
  const { assignedTasks, assignedTasksLoading, assignedTasksError } = useTask();
  const navigate = useNavigate();

  const capitalizedName = () => {
    return fullName
      ? fullName
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      : "User";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    const statusColorMap = {
      PLANNING: "gray",
      ACTIVE: "blue",
      COMPLETED: "green",
      ON_HOLD: "yellow",
      CANCELLED: "red",
    };
    return statusColorMap[status] || "gray";
  };

  const getPriorityLabel = (priority) => {
    if (!priority) return "Not set";
    return priority.charAt(0) + priority.slice(1).toLowerCase();
  };

  const isAdminInOrganization = () => {
    if (!selectedOrganization) return false;
    // Check various possible field names for role from the backend
    // The backend may return: userRole, organizationRole, role, or membership.role
    const role = selectedOrganization.userRole || selectedOrganization.organizationRole || selectedOrganization.role;
    return role && role.toUpperCase() === "ADMIN";
  };

  const completedProjects = projects?.filter((project) => project.projectStatus === "COMPLETED").length || 0;

  const overdueProjects = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (projects || []).filter((project) => {
      if (!project.endDate) return false;
      if (project.projectStatus === "COMPLETED" || project.projectStatus === "CANCELLED") return false;
      const endDate = new Date(project.endDate);
      endDate.setHours(0, 0, 0, 0);
      return endDate < today;
    });
  }, [projects]);

  const projectOverviewItems = useMemo(() => {
    return [...(projects || [])]
      .sort((a, b) => {
        const firstDate = a.endDate ? new Date(a.endDate).getTime() : Number.MAX_SAFE_INTEGER;
        const secondDate = b.endDate ? new Date(b.endDate).getTime() : Number.MAX_SAFE_INTEGER;
        return firstDate - secondDate;
      })
      .slice(0, 6);
  }, [projects]);

  const myTasks = useMemo(() => {
    return (assignedTasks || []).filter((task) => {
      return task.status !== "COMPLETED";
    });
  }, [assignedTasks]);

  const overdueTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return (assignedTasks || []).filter((task) => {
      if (!task.dueDate) return false;
      if (task.status === "COMPLETED") return false;
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today;
    });
  }, [assignedTasks]);

  const stats = [
    {
      title: "Total Projects",
      value: loading ? "..." : (projects?.length || 0),
      subtitle: `projects in ${selectedOrganization?.name || "organization"}`,
      icon: <FolderIcon />,
      color: "blue",
    },
    {
      title: "Completed Projects",
      value: loading ? "..." : completedProjects,
      subtitle: loading ? "loading..." : `of ${projects?.length || 0} total`,
      icon: <CheckCircleIcon />,
      color: "green",
    },
    {
      title: "My Tasks",
      value: assignedTasksLoading ? "..." : myTasks.length,
      subtitle: assignedTasksLoading ? "loading..." : "assigned to me",
      icon: <UsersIcon />,
      color: "purple",
    },
    {
      title: "Overdue",
      value: assignedTasksLoading ? "..." : overdueTasks.length,
      subtitle: assignedTasksLoading ? "loading..." : "tasks past deadline",
      icon: <AlertIcon />,
      color: "orange",
    },
  ];

  return (
    <Box p={30} className="flex-1 bg-slate-50 overflow-auto ">
      {/* Error Alert - Projects */}
      {error && (
        <Alert color="red" mb="md" title="Error Loading Projects" withCloseButton>
          {error}
        </Alert>
      )}

      {/* Error Alert - Tasks */}
      {assignedTasksError && (
        <Alert color="orange" mb="md" title="Error Loading Tasks" withCloseButton>
          {assignedTasksError}
        </Alert>
      )}


      
      {/* Header */}
      <Group justify="space-between" align="flex-start" mb="xl">
        <Box>
          <Text size="1.5rem" fw={700} className="text-gray-900">
            Welcome back, {isValidating ? "Loading..." : capitalizedName()}!
          </Text>
          <Text c="dimmed" mt="xs">
            Here's what's happening with your projects today
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
            radius="md"
            className={isAdminInOrganization() ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}
            onClick={() => navigate("/projects")}
            disabled={!isAdminInOrganization()}
          >
            New Project
          </Button>
        </Tooltip>
      </Group>

      {/* Stats Grid */}
      <Box
        mb={"xl"}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </Box>

      {/* Main Content Grid */}
      <Box className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Overview - Takes 2 columns */}
        <Paper
          p="md"
          radius="lg"
          className="lg:col-span-2 border border-gray-100"
        >
          <Group justify="space-between" mb="lg">
            <Text size="lg" fw={600}>
              Project Overview
            </Text>
            <Button
              variant="subtle"
              color="gray"
              rightSection={<ArrowRightIcon />}
              size="sm"
              onClick={() => navigate("/projects")}
            >
              View all
            </Button>
          </Group>

          {projectOverviewItems.length > 0 ? (
            <Box className="space-y-3">
              {projectOverviewItems.map((project) => (
                <Paper
                  key={project.id}
                  p="md"
                  radius="md"
                  mb={10}
                  withBorder
                  className="border-gray-100 hover:shadow-sm transition-shadow cursor-pointer"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <Group justify="space-between" align="flex-start" mb={6}>
                    <Box>
                      <Text fw={600} className="text-slate-900">{project.name}</Text>
                      <Text size="sm" c="dimmed" lineClamp={1}>
                        {project.description || "No description"}
                      </Text>
                    </Box>
                    <Badge color={getStatusColor(project.projectStatus)} variant="light">
                      {project.projectStatus || "PLANNING"}
                    </Badge>
                  </Group>

                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">Priority: {getPriorityLabel(project.projectPriority)}</Text>
                    <Text size="xs" c="dimmed">Due: {formatDate(project.endDate)}</Text>
                  </Group>
                </Paper>
              ))}
            </Box>
          ) : (
            <Box className="flex flex-col items-center justify-center py-16 overflow-auto">
              <Box className="p-6 bg-slate-100 rounded-2xl mb-4">
                <FolderIcon />
              </Box>
              <Text c="dimmed" size="lg" mb="md">
                No projects yet
              </Text>
              <Button radius="md" color="blue" className="hover:bg-blue-700" onClick={() => navigate("/projects")}>
                Create your First Project
              </Button>
            </Box>
          )}
        </Paper>

        {/* Right Sidebar */}
        <Box className="space-y-6">
          {/* My Tasks Card */}
          <Paper
            p="lg"
            radius="lg"
            className="border border-gray-100 max-h-72 overflow-auto"
          >
            <Group justify="space-between" mb="md">
              <Group gap="xs">
                <PersonIcon />
                <Text fw={600}>My Tasks</Text>
              </Group>
              <Badge color="blue" variant="light" size="lg">
                {assignedTasksLoading ? "..." : myTasks.length}
              </Badge>
            </Group>

            {myTasks.length > 0 ? (
              <Box className="space-y-2">
                {myTasks.slice(0, 5).map((task) => (
                  <Box key={task.id} mb={5} p={10} className="border-b border-gray-200 pb-2">
                    <Text size="sm" fw={500} lineClamp={1}>{task.title}</Text>
                    <Text size="xs" c="dimmed">Due {formatDate(task.dueDate)}</Text>
                  </Box>
                ))}
              </Box>
            ) : (
              <Text c="dimmed" size="sm" ta="center" py="xl">
                No my tasks
              </Text>
            )}
          </Paper>

          {/* Overdue Card */}
          <Paper
            p="lg"
            radius="lg"
            className="border border-gray-100 max-h-72 overflow-auto"
          >
            <Group justify="space-between" mb="md">
              <Group gap="xs">
                <AlertIcon />
                <Text fw={600}>Overdue</Text>
              </Group>
              <Badge color="red" variant="light" size="lg">
                {assignedTasksLoading ? "..." : overdueTasks.length}
              </Badge>
            </Group>

            {overdueTasks.length > 0 ? (
              <Box className="space-y-2">
                {overdueTasks.slice(0, 4).map((task) => (
                  <Box key={task.id} mb={5} className="border-b border-gray-200 pb-2">
                    <Text size="sm" fw={500} lineClamp={1}>{task.title}</Text>
                    <Text size="xs" c="dimmed">Due {formatDate(task.dueDate)}</Text>
                  </Box>
                ))}
              </Box>
            ) : (
              <Text c="dimmed" size="sm" ta="center" py="xl">
                No overdue tasks
              </Text>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
