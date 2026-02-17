import { Box, Text, Button, Paper, Group, Badge, Alert } from "@mantine/core";
import StatsCard from "./StatsCard";
import { useAuth } from "../redux/hooks/useAuth";
import { useProj } from "../redux/hooks/useProj";
import { useOrg } from "../redux/hooks/useOrg";

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
  
  const capitalizedName = () => {
    return fullName
      ? fullName
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      : "User";
  };

  const completedProjects = projects?.filter(p => p.projectStatus === "COMPLETED").length || 0;
  
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
      value: "0",
      subtitle: "assigned to me",
      icon: <UsersIcon />,
      color: "purple",
    },
    {
      title: "Overdue",
      value: "0",
      subtitle: "need attention",
      icon: <AlertIcon />,
      color: "orange",
    },
  ];

  return (
    <Box p={30} className="flex-1 bg-slate-50 overflow-auto ">
      {/* Error Alert */}
      {error && (
        <Alert color="red" mb="md" title="Error Loading Projects" withCloseButton>
          {error}
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
        <Button
          leftSection={<PlusIcon />}
          size="md"
          radius="md"
          className="bg-blue-600 hover:bg-blue-700"
        >
          New Project
        </Button>
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
            >
              View all
            </Button>
          </Group>

          {/* Empty State */}
          <Box className="flex flex-col items-center justify-center py-16 overflow-auto">
            <Box className="p-6 bg-slate-100 rounded-2xl mb-4">
              <FolderIcon />
            </Box>
            <Text c="dimmed" size="lg" mb="md">
              No projects yet
            </Text>
            <Button radius="md" color="blue" className="hover:bg-blue-700">
              Create your First Project
            </Button>
          </Box>
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
                0
              </Badge>
            </Group>
            <Text c="dimmed" size="sm" ta="center" py="xl">
              No my tasks
            </Text>
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
                0
              </Badge>
            </Group>
            <Text c="dimmed" size="sm" ta="center" py="xl">
              No overdue
            </Text>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
