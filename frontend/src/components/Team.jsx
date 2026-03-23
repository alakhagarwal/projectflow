import { useEffect, useState } from "react";
import {
  Box,
  Text,
  Button,
  Paper,
  TextInput,
  Table,
  Avatar,
  Badge,
  Group,
  SimpleGrid,
  Alert,
} from "@mantine/core";
import StatsCard from "./StatsCard";
import { useMember } from "../redux/hooks/useMember";
import { useOrg } from "../redux/hooks/useOrg";
import { useProj } from "../redux/hooks/useProj";
import InviteMember from "./InviteMember";
// Icons
const UsersIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ActivityIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const UserPlusIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);

export default function Team() {
  const [searchQuery, setSearchQuery] = useState("");
  const { members, loading, error, loadMembers } = useMember();
  const [inviteMemberopened, setInviteMemberOpened] = useState(false);
  const { selectedOrganization } = useOrg();
  const { projects } = useProj();

  useEffect(() => {
    if (selectedOrganization?.id && !loading) {
      loadMembers(selectedOrganization.id);
    }
  }, [loadMembers, selectedOrganization?.id]);

// On ANY mount after the first:

// React compares current dependency values with previous dependency values
// If ANY dependency changed → Effect runs ✅
// If ALL dependencies are the same → Effect skips ❌

  const activemembers = members.filter(
    (member) => member.memberStatus === "ACTIVE",
  );

  const activeProjects = projects.filter(
    (project) => project.projectStatus === "ACTIVE",
  );

  const filteredMembers = members.filter((member) => {
    const searchLower = searchQuery.toLowerCase();
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      member.email.toLowerCase().includes(searchLower) ||
      member.organizationRole.toLowerCase().includes(searchLower)
    );
  });

  // Get initials for avatar
  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  // Get avatar color based on name
  const getAvatarColor = (name) => {
    const colors = [
      "red",
      "pink",
      "grape",
      "violet",
      "indigo",
      "blue",
      "cyan",
      "teal",
      "green",
      "lime",
      "yellow",
      "orange",
    ];
    const index = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  return (
    <Box p="xl">
      {/* Header */}
      <Group justify="space-between" mb="xl">
        <Box>
          <Text size="1.75rem" fw={700} className="text-gray-900">
            Team
          </Text>
          <Text size="sm" c="dimmed" mt={4}>
            Manage team members and their contributions
          </Text>
        </Box>
        <Button
          leftSection={<UserPlusIcon />}
          size="md"
          radius="md"
          className="bg-blue-500 hover:bg-blue-600"
          onClick={()=> setInviteMemberOpened(true)}
        >
          Invite Member
        </Button>
      </Group>

      {/* Stats Cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 2 }} spacing="lg" mb="xl">
        <StatsCard
          title="Total Members"
          value={activemembers.length}
          icon={<UsersIcon />}
          color="blue"
        />
        <StatsCard
          title="Active Projects"
          value={activeProjects.length}
          icon={<ActivityIcon />}
          color="green"
        />
      </SimpleGrid>

      {/* Search Bar */}
      <TextInput
        placeholder="Search team members..."
        leftSection={<SearchIcon />}
        size="md"
        radius="md"
        mb="xl"
        className="max-w-md"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.currentTarget.value)}
      />

      {error && (
        <Text color="red" mb="xl">
          {error}
        </Text>
      )}

      {/* Members Table */}
      <Paper radius="lg" className="border border-gray-100 overflow-hidden">
        <Table highlightOnHover verticalSpacing="md">
          <Table.Thead className="bg-gray-50">
            <Table.Tr>
              <Table.Th>
                <Text fw={600} size="sm" c="dimmed">
                  Name
                </Text>
              </Table.Th>
              <Table.Th>
                <Text fw={600} size="sm" c="dimmed">
                  Email
                </Text>
              </Table.Th>
              <Table.Th>
                <Text fw={600} size="sm" c="dimmed">
                  Role
                </Text>
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredMembers.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={3}>
                  <Text ta="center" c="dimmed" py="xl">
                    No members found
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              filteredMembers.map((member) => (
                <Table.Tr key={member.id}>
                  <Table.Td>
                    <Group gap="sm">
                      <Avatar
                        color={getAvatarColor(member.firstName)}
                        radius="xl"
                        size="md"
                      >
                        {getInitials(member.firstName, member.lastName)}
                      </Avatar>
                      <Text fw={500} size="sm">
                        {member.firstName} {member.lastName}
                      </Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {member.email}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      variant="light"
                      color={
                        member.organizationRole === "ADMIN" ? "violet" : "blue"
                      }
                      size="lg"
                      radius="sm"
                    >
                      {member.organizationRole}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Paper>

      <InviteMember
        opened={inviteMemberopened}
        onClose={() => setInviteMemberOpened(false)}
      />
    </Box>
  );
}
