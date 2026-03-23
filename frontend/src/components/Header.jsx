import { useState } from "react";
import { Avatar, Group, Box, Menu, Divider, Text } from "@mantine/core";
import "./Header.css";
import { useAuth } from "../redux/hooks/useAuth";
import BrandLogo from "./BrandLogo";
import ProfileSettingsModal from "./ProfileSettingsModal";

const SettingsIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const SignOutIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export default function Header() {
  const { fullName, email, logout } = useAuth();
  const [settingsOpened, setSettingsOpened] = useState(false);
  
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join("");
  };

  const getAvatarColor = (name) => {
    if (!name) return "indigo";
    const colors = ["red", "pink", "grape", "violet", "indigo", "blue", "cyan", "teal", "green", "lime", "orange"];
    const index = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const initials = getInitials(fullName);
  const avatarColor = getAvatarColor(fullName);

  const handleLogout = () => {
    logout();
  };

  return (
    <Box
      px={20}
      py={10}
      className="bg-white border-b border-slate-200 flex items-center justify-between"
    >
      <Group gap="md" align="center" wrap="nowrap">
        <BrandLogo />
      </Group>

      {/* Right Section */}
      <Group gap="sm">
        <Menu shadow="xl" width={280} position="bottom-end" offset={4}>
          <Menu.Target>
            <Avatar color={avatarColor} radius="xl" size="md" className="header-avatar cursor-pointer">
              {initials}
            </Avatar>
          </Menu.Target>
          <Menu.Dropdown p={0} className="border-slate-200 shadow-xl overflow-hidden">
            {/* User Profile Block */}
            <Box px="lg" py="md" className="bg-white">
              <Group gap="md" wrap="nowrap">
                <Avatar color="orange.7" radius="xl" size="md">
                  {initials}
                </Avatar>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text size="sm" fw={600} c="dark" lineClamp={1}>
                    {fullName || "User"}
                  </Text>
                  <Text size="xs" c="dimmed" lineClamp={1}>
                    {email}
                  </Text>
                </div>
              </Group>
            </Box>

            <Divider color="gray.2" />

            {/* Manage Account */}
            <Box px={8} py={8}>
              <Menu.Item
                leftSection={<SettingsIcon />}
                onClick={() => setSettingsOpened(true)}
                className="hover:bg-gray-50 rounded-md py-2 px-3"
              >
                <Text size="sm" fw={500} c="dark.5">
                  Manage account
                </Text>
              </Menu.Item>
            </Box>

            <Divider color="gray.2" />

            {/* Sign Out */}
            <Box px={8} py={8}>
              <Menu.Item
                leftSection={<SignOutIcon />}
                onClick={handleLogout}
                className="hover:bg-gray-50 rounded-md py-2 px-3"
              >
                <Text size="sm" fw={500} c="dark.5">
                  Sign out
                </Text>
              </Menu.Item>
            </Box>
          </Menu.Dropdown>
        </Menu>
      </Group>

      {/* Settings Modal */}
      <ProfileSettingsModal
        opened={settingsOpened}
        onClose={() => setSettingsOpened(false)}
      />
    </Box>
  );
}
