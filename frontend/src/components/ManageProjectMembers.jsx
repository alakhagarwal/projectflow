import { useMemo, useState } from "react";
import {
  Modal,
  Text,
  TextInput,
  Select,
  Group,
  Button,
  Stack,
  Paper,
  Table,
  Badge,
} from "@mantine/core";

const ROLE_OPTIONS = [
  { value: "MEMBER", label: "Member" },
  { value: "LEAD", label: "Lead" },
];

const getDisplayName = (member) => {
  if (member?.name) return member.name;
  if (member?.email) return member.email.split("@")[0];
  return "Unknown";
};

export default function ManageProjectMembers({
  opened,
  onClose,
  projectName,
  members = [],
  onAddMember,
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [localMembers, setLocalMembers] = useState([]);

  const mergedMembers = useMemo(() => {
    const seen = new Set();
    const list = [];

    [...members, ...localMembers].forEach((member) => {
      if (!member?.email || seen.has(member.email)) return;
      seen.add(member.email);
      list.push(member);
    });

    return list;
  }, [localMembers, members]);

  const handleAdd = (event) => {
    event.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) return;

    const simpleEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!simpleEmailRegex.test(trimmedEmail)) return;

    const alreadyExists = mergedMembers.some((member) => member.email === trimmedEmail);
    if (alreadyExists) return;

    const newMember = {
      email: trimmedEmail,
      role: role || "MEMBER",
      name: trimmedEmail.split("@")[0],
    };

    setLocalMembers((prev) => [...prev, newMember]);

    if (onAddMember) {
      onAddMember({ email: trimmedEmail, role: role || "MEMBER" });
    }

    setEmail("");
    setRole("MEMBER");
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size={760}
      radius="md"
      title={<Text fw={700}>Manage Project Members</Text>}
      overlayProps={{ backgroundOpacity: 0.3, blur: 2 }}
    >
      <Stack gap="lg">
        <Paper withBorder radius="md" p="md">
          <Text fw={600} mb={6}>Add member to {projectName || "this project"}</Text>
          <Text c="dimmed" size="sm" mb="md">
            Add members by email and assign their project role.
          </Text>

          <form onSubmit={handleAdd}>
            <Group align="end" grow>
              <TextInput
                label="Member Email"
                placeholder="john@company.com"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                required
              />
              <Select
                label="Role"
                data={ROLE_OPTIONS}
                value={role}
                onChange={setRole}
                allowDeselect={false}
              />
              <Button type="submit" radius="md">
                Add Member
              </Button>
            </Group>
          </form>
        </Paper>

        <Paper withBorder radius="md" className="overflow-hidden">
          <Table highlightOnHover verticalSpacing="md">
            <Table.Thead className="bg-gray-50">
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Role</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {mergedMembers.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={3}>
                    <Text c="dimmed" ta="center" py="md">
                      No members added yet.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                mergedMembers.map((member) => (
                  <Table.Tr key={member.email}>
                    <Table.Td>{getDisplayName(member)}</Table.Td>
                    <Table.Td>{member.email}</Table.Td>
                    <Table.Td>
                      <Badge radius="sm" variant="light" color={member.role === "LEAD" ? "blue" : "gray"}>
                        {member.role || "MEMBER"}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </Paper>

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Close
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
