import { useState } from "react";
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

// Icons as simple components
const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const ProjectsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const TeamIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

const TaskIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
    style={{ transform: direction === "right" ? "rotate(-90deg)" : "rotate(0)" }}
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const OrgIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 9h6M9 13h6M9 17h4" />
  </svg>
);

export default function Sidebar({ activeItem = "dashboard", onNavigate }) {
  const [orgMenuOpened, setOrgMenuOpened] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <DashboardIcon /> },
    { id: "projects", label: "Projects", icon: <ProjectsIcon /> },
    { id: "team", label: "Team", icon: <TeamIcon /> },
    { id: "settings", label: "Settings", icon: <SettingsIcon /> },
  ];

  return (
    <Box p={20}  className="w-66 h-screen bg-white border-r border-gray-200 flex flex-col gap-4">
      {/* Organization Selector */}
      <Menu opened={orgMenuOpened} onChange={setOrgMenuOpened} position="bottom-start" width={220}>
        <Menu.Target>
          <UnstyledButton className="w-full p-4 hover:bg-blue-50 transition-colors">
            <Group gap="sm">
              <Avatar color="blue" radius="md" size="md">
                <OrgIcon />
              </Avatar>
              <Box style={{ flex: 1 }}>
                <Text size="sm" fw={600} c="dark">
                  Org1
                </Text>
                <Text size="xs" c="dimmed">
                  1 workspace
                </Text>
              </Box>
              <ChevronIcon />
            </Group>
          </UnstyledButton>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item>
            <Text fw={400} size="sm">Org1</Text>
          </Menu.Item>
          <Menu.Item>
            <Text fw={400} size="sm">Org2</Text>
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item >Create Organization</Menu.Item>
        </Menu.Dropdown>
      </Menu>

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
    </Box>
  );
}
