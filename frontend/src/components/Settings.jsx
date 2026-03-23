import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Text,
  TextInput,
  Textarea,
  Select,
  Button,
  Stack,
  Group,
  Alert,
  Divider,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";

const PROJECT_STATUS_OPTIONS = [
  { value: "PLANNING", label: "Planning" },
  { value: "ACTIVE", label: "Active" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "CANCELLED", label: "Cancelled" },
];

const PROJECT_PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

export default function Settings({ project, updateProjectAsync, updateLoading }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    projectStatus: null,
    projectPriority: null,
    startDate: "",
    endDate: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  // Seed form whenever the project prop changes (e.g. on first load)
  useEffect(() => {
    if (!project) return;
    setFormData({
      name: project.name || "",
      description: project.description || "",
      projectStatus: project.projectStatus || null,
      projectPriority: project.projectPriority || null,
      startDate: project.startDate || "",
      endDate: project.endDate || "",
    });
  }, [project]);

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
    if (!formData.name?.trim()) errors.name = "Project name is required";
    if (!formData.description?.trim()) errors.description = "Description is required";
    if (!formData.projectStatus) errors.projectStatus = "Status is required";
    if (!formData.projectPriority) errors.projectPriority = "Priority is required";
    if (!formData.startDate) errors.startDate = "Start date is required";
    if (!formData.endDate) {
      errors.endDate = "End date is required";
    } else if (formData.startDate && formData.endDate <= formData.startDate) {
      errors.endDate = "End date must be after start date";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    if (!validate()) return;

    try {
      await updateProjectAsync({
        projectId: project.id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        projectStatus: formData.projectStatus,
        projectPriority: formData.projectPriority,
        startDate: formData.startDate,
        endDate: formData.endDate,
      }).unwrap();

      notifications.show({
        title: "Saved",
        message: "Project updated successfully",
        color: "green",
      });
    } catch (error) {
      const message = error || "Failed to update project";
      setSubmitError(message);
      notifications.show({
        title: "Error",
        message,
        color: "red",
      });
    }
  };

  if (!project) {
    return (
      <Paper radius="lg" withBorder p="xl" className="border-slate-200 bg-white">
        <Text c="dimmed" ta="center">
          Project not found.
        </Text>
      </Paper>
    );
  }

  return (
    <Paper radius="lg" withBorder p="xl" className="border-slate-200 bg-white">
      <Box mb={24}>
        <Text size="lg" fw={600} className="text-slate-900">
          Project Settings
        </Text>
        <Text size="sm" c="dimmed" mt={4}>
          Update your project details below.
        </Text>
      </Box>

      <Divider mb={24} />

      {submitError && (
        <Alert color="red" mb="lg" withCloseButton onClose={() => setSubmitError(null)}>
          {submitError}
        </Alert>
      )}

      <Stack gap="lg">
        {/* Name */}
        <TextInput
          label="Project Name"
          placeholder="Enter project name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          required
          size="md"
          error={fieldErrors.name}
        />

        {/* Description */}
        <Textarea
          label="Description"
          placeholder="Enter project description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          required
          size="md"
          minRows={3}
          maxRows={6}
          error={fieldErrors.description}
        />

        {/* Status & Priority */}
        <Box
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          <Select
            label="Status"
            placeholder="Select status"
            value={formData.projectStatus}
            onChange={(value) => handleChange("projectStatus", value)}
            data={PROJECT_STATUS_OPTIONS}
            size="md"
            error={fieldErrors.projectStatus}
          />
          <Select
            label="Priority"
            placeholder="Select priority"
            value={formData.projectPriority}
            onChange={(value) => handleChange("projectPriority", value)}
            data={PROJECT_PRIORITY_OPTIONS}
            size="md"
            error={fieldErrors.projectPriority}
          />
        </Box>

        {/* Start & End Date */}
        <Box
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          <TextInput
            label="Start Date"
            type="date"
            value={formData.startDate}
            onChange={(e) => handleChange("startDate", e.target.value)}
            required
            size="md"
            error={fieldErrors.startDate}
          />
          <TextInput
            label="End Date"
            type="date"
            value={formData.endDate}
            onChange={(e) => handleChange("endDate", e.target.value)}
            required
            size="md"
            min={formData.startDate || undefined}
            error={fieldErrors.endDate}
          />
        </Box>

        {/* Save Button */}
        <Group justify="flex-end" mt={8}>
          <Button
            size="md"
            radius="md"
            onClick={handleSubmit}
            loading={updateLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Save Changes
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
