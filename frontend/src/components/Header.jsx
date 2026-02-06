import { TextInput, Avatar, ActionIcon, Group, Box, Menu } from "@mantine/core";
import "./Header.css";
import {useAuth} from "../redux/hooks/useAuth";

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

const ThemeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

export default function Header({ userName = "User" }) {
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

    const { logout } = useAuth();

    const handleLogout = () => {
      logout();
    }

  return (
    <Box p={15}  className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
      {/* Search Bar */}
      <TextInput  
        placeholder="Search projects, tasks..."
        leftSection={<SearchIcon />}
        className="header-search-input"
        w={384}
      />

      {/* Right Section */}
      <Group gap="md">
        <ActionIcon variant="subtle" color="gray" size="lg" radius="md" className="header-action-icon">
          <ThemeIcon />
        </ActionIcon>
        <Menu shadow="md" width={200} className="header-menu">
          <Menu.Target>
            <Avatar color="blue" radius="xl" size="md">
              {initials}
            </Avatar>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item color="red" onClick={handleLogout}>Logout</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Box>
  );
}
