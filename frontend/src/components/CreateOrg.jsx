import { useState, useRef } from "react";
import {
  Modal,
  TextInput,
  Button,
  Box,
  Text,
  Group,
  Avatar,
  FileButton,
  Stack,
  Alert,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useOrg } from "../redux/hooks/useOrg";

const UploadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function CreateOrg({ opened, onClose, forced = false, onSuccess }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const { addOrganization, loading, error } = useOrg();

  // Auto-generate slug from name
  const handleNameChange = (value) => {
    setName(value);
    // Auto-generate slug: lowercase, replace spaces with hyphens
    const generatedSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .trim();
    setSlug(generatedSlug);
  };

  const handleLogoChange = (file) => {
    if (file) {
      // Validate file size (10MB max)
      const MAX_FILE_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        setErrorMsg("File size must be less than 10MB");
        return;
      }

      // Validate file type
      const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml'];
      if (!ALLOWED_TYPES.includes(file.type)) {
        setErrorMsg("Please upload a valid image file (PNG, JPG, GIF, SVG)");
        return;
      }

      setErrorMsg(null);
      setLogo(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setErrorMsg(null);

    try {
      await addOrganization(name, slug, logo).unwrap();
      
      // Show success notification
      notifications.show({
        title: "Success",
        message: "Organization created successfully!",
        color: "green",
      });
      
      // Close modal and reset form
      onClose();
      resetForm();
      
      // Call success callback if provided (to reload organizations)
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const errorMessage = error || "Failed to create organization";
      setErrorMsg(errorMessage);
      notifications.show({
        title: "Error",
        message: errorMessage,
        color: "red",
      });
    }
  };

  const resetForm = () => {
    setName("");
    setSlug("");
    setLogo(null);
    setLogoPreview(null);
    setErrorMsg(null);
  };

  const isValid = name.trim().length > 0 && slug.trim().length > 0;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={forced ? "Create your first organization" : "Create organization"}
      size="md"
      centered
      closeOnClickOutside={!forced}
      closeOnEscape={!forced}
      withCloseButton={!forced}
      styles={{
        title: {
          fontSize: "1.25rem",
          fontWeight: 600,
        },
      }}
    >
      {forced && (
        <Text size="sm" c="dimmed" mb="lg">
          To get started, please create your first organization.
        </Text>
      )}
      
      {errorMsg && (
        <Alert color="red" mb="md" withCloseButton onClose={() => setErrorMsg(null)}>
          {errorMsg}
        </Alert>
      )}
      
      <Stack gap="lg">
        {/* Logo Upload */}
        <Box>
          <Text size="sm" fw={500} mb="xs">
            Logo
          </Text>
          <Group gap="md">
            {/* Logo Preview or Placeholder */}
            <Box
              style={{
                width: 80,
                height: 80,
                border: "2px dashed #cbd5e1",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f8fafc",
                overflow: "hidden",
              }}
            >
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <UploadIcon />
              )}
            </Box>

            <Box>
              <FileButton
                onChange={handleLogoChange}
                accept="image/png,image/jpeg,image/jpg,image/gif,image/svg+xml"
              >
                {(props) => (
                  <Button {...props} variant="outline" size="sm">
                    Upload
                  </Button>
                )}
              </FileButton>
              <Text size="xs" c="dimmed" mt={4}>
                Recommended size 1:1, up to 10MB.
              </Text>
            </Box>
          </Group>
        </Box>

        {/* Organization Name */}
        <TextInput
          label="Name"
          placeholder="Organization name"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          required
          size="md"
        />

        {/* Slug */}
        <TextInput
          label="Slug"
          placeholder="my-org"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
          size="md"
          description="This will be used in URLs"
        />

        {/* Submit Button */}
        <Button
          fullWidth
          size="md"
          onClick={handleSubmit}
          disabled={!isValid}
          loading={loading}
          style={{
            backgroundColor: isValid ? "#2563eb" : "#94a3b8",
            cursor: isValid ? "pointer" : "not-allowed",
          }}
        >
          Create organization
        </Button>
      </Stack>
    </Modal>
  );
}
