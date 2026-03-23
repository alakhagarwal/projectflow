import { useState, useEffect } from "react";
import {
  Modal,
  TextInput,
  Button,
  Stack,
  Text,
  Box,
  Group,
  Avatar,
  Divider,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useAuth } from "../redux/hooks/useAuth";

export default function ProfileSettingsModal({ opened, onClose }) {
  const {
    email,
    fullName,
    updateProfile,
    updateProfileLoading,
    updateProfileError,
  } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (fullName) {
      const parts = fullName.split(" ");
      const first = parts[0] || "";
      const last = parts.slice(1).join(" ") || "";
      setFormData({ firstName: first, lastName: last });
    }
  }, [fullName, opened]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await updateProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
      }).unwrap();

      notifications.show({
        title: "Success",
        message: "Profile updated successfully!",
        color: "green",
      });
      onClose();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: updateProfileError || error || "Failed to update profile",
        color: "red",
      });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text size="xl" fw={600}>
          Profile Settings
        </Text>
      }
      size="md"
      centered
      radius="md"
    >
      <Box mb="xl" className="flex flex-col items-center">
        <Avatar color="blue" radius="xl" size="xl" mb="sm">
          {formData.firstName.charAt(0).toUpperCase()}
        </Avatar>
        <Text size="lg" fw={500}>
          {fullName}
        </Text>
        <Text size="sm" c="dimmed">
          {email}
        </Text>
      </Box>

      <Divider mb="xl" />

      <Stack gap="md">
        <TextInput
          label="Email Address"
          value={email || ""}
          disabled
          description="Your email address is used for login and cannot be changed here."
          size="md"
        />

        <Group grow align="flex-start" mt="sm">
          <TextInput
            label="First Name"
            placeholder="Your first name"
            value={formData.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            required
            size="md"
            error={fieldErrors.firstName}
          />
          <TextInput
            label="Last Name"
            placeholder="Your last name"
            value={formData.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            size="md"
          />
        </Group>

        <Box mt="xl">
          <Button
            fullWidth
            size="md"
            onClick={handleSubmit}
            loading={updateProfileLoading}
            className="bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </Button>
        </Box>
      </Stack>
    </Modal>
  );
}
