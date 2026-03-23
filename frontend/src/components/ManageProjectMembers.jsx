import { useCallback, useEffect, useMemo, useState } from "react";
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
  Alert,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useProjMember } from "../redux/hooks/useprojMember";

const ROLE_OPTIONS = [
  { value: "MEMBER", label: "Member" },
  { value: "LEAD", label: "Lead" },
];

const getDisplayName = (member) => {
  if (member?.memberName) return member.memberName;
  if (member?.name) return member.name;
  const email = member?.userEmail || member?.email;
  if (email) return email.split("@")[0];
  return "Unknown";
};

const getMemberEmail = (member) => member?.userEmail || member?.email || "";

const getMemberRole = (member) => member?.projectRole || member?.role || "MEMBER";

const mapAddMemberErrorMessage = (error) => {
  const rawMessage = typeof error === "string" ? error : error?.message || "";
  const normalized = rawMessage.toLowerCase();

  if (normalized.includes("already a member of this project")) {
    return "This user is already a member of the project.";
  }

  if (normalized.includes("active member of the organization")) {
    return "This user is not an active member of the organization.";
  }

  return rawMessage || "Failed to add project member";
};

export default function ManageProjectMembers({
  opened,
  onClose,
  projectId,
  projectName,
}) {
  const {
    members,
    loading,
    error: fetchError,
    addMemberToProject,
    loadProjectMembers,
    clearProjectMembers,
  } = useProjMember();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [formError, setFormError] = useState(null);
  const [fetchErrorDismissed, setFetchErrorDismissed] = useState(false);

  const normalizedMembers = useMemo(() => {
    const seen = new Set();
    const list = [];

    members.forEach((member) => {
      const memberEmail = getMemberEmail(member).toLowerCase();
      if (!memberEmail || seen.has(memberEmail)) return;
      seen.add(memberEmail);
      list.push(member);
    });

    return list;
  }, [members]);

  const handleAdd = useCallback(async (event) => {
    event.preventDefault();
    setFormError(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || loading) return;

    const simpleEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!simpleEmailRegex.test(trimmedEmail)) {
      const invalidEmailError = "Please enter a valid email address.";
      setFormError(invalidEmailError);
      return;
    }

    const alreadyExists = normalizedMembers.some(
      (member) => getMemberEmail(member).toLowerCase() === trimmedEmail,
    );
    if (alreadyExists) {
      const duplicateError = "This user is already a member of the project.";
      setFormError(duplicateError);
      return;
    }

    try {
      await addMemberToProject(projectId, trimmedEmail, role || "MEMBER").unwrap();
      notifications.show({
        title: "Success",
        message: "Project member added successfully",
        color: "green",
      });
    } catch (error) {
      const errorMessage = mapAddMemberErrorMessage(error);
      setFormError(errorMessage);
      return;
    }

    setEmail("");
    setRole("MEMBER");
  }, [addMemberToProject, email, loading, normalizedMembers, projectId, role]);

  useEffect(() => {
    if (!opened || !projectId) return;

    loadProjectMembers(projectId);
  }, [loadProjectMembers, opened, projectId]);

  useEffect(() => {
    if (fetchError) {
      setFetchErrorDismissed(false);
    }
  }, [fetchError]);

  useEffect(() => {
    return () => {
      clearProjectMembers();
    };
  }, [clearProjectMembers]);

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
        {formError && (
          <Alert color="red" withCloseButton onClose={() => setFormError(null)}>
            {formError}
          </Alert>
        )}
        {fetchError && !fetchErrorDismissed && (
          <Alert color="red" withCloseButton onClose={() => setFetchErrorDismissed(true)}>
            {fetchError}
          </Alert>
        )}

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
                disabled={loading}
              />
              <Select
                label="Role"
                data={ROLE_OPTIONS}
                value={role}
                onChange={setRole}
                allowDeselect={false}
                disabled={loading}
              />
              <Button type="submit" radius="md" disabled={loading}>
                {loading ? "Adding..." : "Add Member"}
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
              {normalizedMembers.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={3}>
                    <Text c="dimmed" ta="center" py="md">
                      No members added yet.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                normalizedMembers.map((member) => {
                  const memberEmail = getMemberEmail(member);
                  const memberRole = getMemberRole(member);
                  return (
                  <Table.Tr key={member.userId || memberEmail}>
                    <Table.Td>{getDisplayName(member)}</Table.Td>
                    <Table.Td>{memberEmail}</Table.Td>
                    <Table.Td>
                      <Badge radius="sm" variant="light" color={memberRole === "LEAD" ? "blue" : "gray"}>
                        {memberRole}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                  );
                })
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
