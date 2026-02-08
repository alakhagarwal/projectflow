import { useEffect, useState } from "react";
import {
  Box,
  NavLink,
  Text,
  Avatar,
  Menu,
  UnstyledButton,
  Group,
  Divider,
  Badge,
} from "@mantine/core";
import { useOrg } from "../redux/hooks/useOrg";
import CreateOrg from "./CreateOrg";

// Icons as simple components
const DashboardIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const ProjectsIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const TeamIcon = () => (
  <svg
    width="20"
    height="20"
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

const SettingsIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

const TaskIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

const ChevronIcon = ({ direction = "down" }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    style={{
      transform: direction === "right" ? "rotate(-90deg)" : "rotate(0)",
    }}
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const PlusIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export default function Sidebar({ activeItem = "dashboard", onNavigate }) {
  const [orgMenuOpened, setOrgMenuOpened] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [createOrgOpened, setCreateOrgOpened] = useState(false);
  const { organizations, loading, error, loadOrganizations } = useOrg();

  useEffect(() => {
    loadOrganizations();
  }, []);

  useEffect(() => {
    // Auto-select first organization when loaded
    if (organizations.length > 0 && !selectedOrg) {
      setSelectedOrg(organizations[0]);
    }
  }, [organizations, selectedOrg]);

  const handleOrgSelect = (org) => {
    setSelectedOrg(org);
    setOrgMenuOpened(false);
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <DashboardIcon /> },
    { id: "projects", label: "Projects", icon: <ProjectsIcon /> },
    { id: "team", label: "Team", icon: <TeamIcon /> },
    { id: "settings", label: "Settings", icon: <SettingsIcon /> },
  ];

  return (
    <Box
      p={20}
      className="w-66 h-screen bg-white border-r border-gray-200 flex flex-col gap-4"
    >
      {/* Organization Selector */}
      {!loading && !error && organizations.length > 0 && (
        <Menu
          opened={orgMenuOpened}
          onChange={setOrgMenuOpened}
          position="bottom-start"
          width={240}
        >
          <Menu.Target>
            <UnstyledButton className="w-full p-3 rounded-lg hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100">
              <Group gap="sm">
                {/* Show logo if available, otherwise show initials */}
                {selectedOrg?.logoUrl ? (
                  <Avatar
                    src={selectedOrg.logoUrl}
                    alt={selectedOrg.name}
                    radius="md"
                    size="md"
                  />
                ) : (
                  <Avatar color="blue" radius="md" size="md">
                    {selectedOrg?.name.charAt(0).toUpperCase()}
                  </Avatar>
                )}
                <Box style={{ flex: 1 }}>
                  <Text size="sm" fw={600} c="dark" lineClamp={1}>
                    {selectedOrg?.name}
                  </Text>
                  <Text size="xs" c="dimmed" mt={2}>
                    {organizations.length}{" "}
                    {organizations.length === 1 ? "Workspace" : "Workspaces"}
                  </Text>
                </Box>
                <ChevronIcon direction={orgMenuOpened ? "up" : "down"} />
              </Group>
            </UnstyledButton>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>WorkSpaces</Menu.Label>
            {organizations.map((org) => (
              <Menu.Item
                key={org.id}
                onClick={() => handleOrgSelect(org)}
                leftSection={
                  org.logoUrl ? (
                    <Avatar
                      src={org.logoUrl}
                      alt={org.name}
                      size="sm"
                      radius="sm"
                    />
                  ) : (
                    <Avatar color="blue" size="sm" radius="sm">
                      {org.name.charAt(0).toUpperCase()}
                    </Avatar>
                  )
                }
                style={{
                  backgroundColor:
                    selectedOrg?.id === org.id ? "#EBF5FF" : "transparent",
                }}
              >
                <Box>
                  <Text fw={500} size="sm">
                    {org.name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    /{org.slug}
                  </Text>
                </Box>
              </Menu.Item>
            ))}
            <Menu.Divider />
            <Menu.Item
              leftSection={<PlusIcon />}
              fw={400}
              c="blue"
              onClick={() => setCreateOrgOpened(true)}
            >
              Create Organization
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      )}

      {loading && (
        <Box className="p-4 text-center">
          <Text size="sm" c="dimmed">
            Loading organizations...
          </Text>
        </Box>
      )}

      {error && (
        <Box className="p-4 bg-red-50 rounded-lg">
          <Text size="sm" c="red">
            {error}
          </Text>
        </Box>
      )}

      {!loading && !error && organizations.length === 0 && (
        <Box p="md" style={{ 
          backgroundColor: '#F8FAFC', 
          borderRadius: '8px',
          border: '1px solid #E2E8F0'
        }}>
          <Text size="sm" c="dimmed" mb="sm" ta="center">
            No organizations yet
          </Text>
          <UnstyledButton
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#2563EB',
              backgroundColor: 'white',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              
            }}
            onClick={() => setCreateOrgOpened(true)}
          >
            + Create your first organization
          </UnstyledButton>
        </Box>
      )}

      <Divider />

      {/* Navigation */}
      <Box className="flex-1 py-2">
        {navItems.map((item) => (
          <NavLink // change it to navlink of react for routing
            key={item.id}
            label={item.label}
            leftSection={item.icon}
            active={activeItem === item.id}
            onClick={() => onNavigate?.(item.id)}
            className="mx-2 rounded-md"
            styles={{
              root: {
                "&[dataActive]": {
                  backgroundColor: "#EBF5FF",
                  color: "#2563EB",
                },
                "&:hover": {
                  backgroundColor: "#F0F7FF",
                },
              },
            }}
          />
        ))}

        <Divider my="sm" />

        {/* My Tasks */}
        <NavLink
          label={
            <Group gap="xs">
              <span>My Tasks</span>
              <Badge size="sm" variant="light" color="blue">
                0
              </Badge>
            </Group>
          }
          leftSection={<TaskIcon />}
          rightSection={<ChevronIcon direction="right" />}
          className="mx-2 rounded-md"
        />

        <Divider my="sm" />

        {/* Projects Section */}
        <Box className="px-4 py-2">
          <Group justify="space-between">
            <Text size="xs" fw={600} c="dimmed" tt="uppercase">
              Projects
            </Text>
            <ChevronIcon direction="right" />
          </Group>
        </Box>
      </Box>

      {/* Create Organization Modal */}
      <CreateOrg
        opened={createOrgOpened}
        onClose={() => setCreateOrgOpened(false)}
        onSuccess={() => loadOrganizations()}
      />
    </Box>
  );
}
