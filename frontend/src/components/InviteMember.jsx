import { useState } from "react";
import {
  Modal,
  TextInput,
  Button,
  Box,
  Text,
  Stack,
  Select,
  Group,
  Alert,
} from "@mantine/core";
import { useOrg } from "../redux/hooks/useOrg";
import { useMember } from "../redux/hooks/useMember";
import { notifications } from "@mantine/notifications";

const EmailIcon = () => (
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
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m2 7 10 7 10-7" />
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
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" y1="8" x2="19" y2="14" />
    <line x1="22" y1="11" x2="16" y2="11" />
  </svg>
);

export default function InviteMember({ opened, onClose }) {
  const { selectedOrganization } = useOrg();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");
  const { inviteNewMember, inviteError, loading } = useMember();

  // Role options matching the backend enum
  const roleOptions = [
    { value: "MEMBER", label: "Member" },
    { value: "ADMIN", label: "Admin" },
  ];

  // Handle form submission
  const handleSubmit = async () => {


    try {
      await inviteNewMember(selectedOrganization.id, email, role).unwrap();

      notifications.show({
        title: "Success",
        message: `Invitation sent to ${email}`,
        color: "green",
      });

      onClose();
      setEmail("");
      setRole("MEMBER");
    } catch (err) {
      console.error("Failed to invite member:", err);
    }


  };

  // Reset form
  const resetForm = () => {
    setEmail("");
    setRole("MEMBER");
  };

  // Close modal and reset
  const handleClose = () => {
    onClose();
    resetForm();
  };

  // Validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValid = email.trim() && isValidEmail(email);

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="xs">
          <PlusIcon />
          <Text fw={600} size="lg">
            Invite Team Member
          </Text>
        </Group>
      }
      size="md"
      centered
      styles={{
        title: {
          fontSize: "1.25rem",
          fontWeight: 600,
        },
      }}
    >
      {inviteError && (
        <Alert
          color="red"
          mb="md"
        >
          {inviteError}
        </Alert>
      )}

      {/* Workspace Info */}
      <Box mb="lg">
        <Text size="sm" c="dimmed">
          Inviting to workspace:{" "}
          <Text component="span" fw={500} c="blue">
            {selectedOrganization?.name || "Not selected"}
          </Text>
        </Text>
      </Box>

      <Stack gap="lg">
        {/* Email Input */}
        <TextInput
          label="Email Address"
          placeholder="Enter email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          size="md"
          leftSection={<EmailIcon />}
          type="email"
          error={
            email && !isValidEmail(email)
              ? "Please enter a valid email address"
              : null
          }
        />

        {/* Role Select */}
        <Select
          label="Role"
          placeholder="Select role"
          value={role}
          onChange={(value) => setRole(value)}
          data={roleOptions}
          size="md"
          required
          allowDeselect={false}
        />

        {/* Action Buttons */}
        <Group justify="flex-end" gap="sm" mt="md">
          <Button variant="subtle" color="gray" onClick={handleClose} size="md">
            Cancel
          </Button>
          <Button
            size="md"
            onClick={handleSubmit}
            disabled={!isValid}
            loading={loading}
            style={{
              backgroundColor: isValid ? "#2563eb" : "#94a3b8",
              cursor: isValid ? "pointer" : "not-allowed",
            }}
          >
            Send Invitation
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
