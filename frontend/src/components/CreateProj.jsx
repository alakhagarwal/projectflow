import { useEffect, useState } from "react";
import {
  Modal,
  TextInput,
  Textarea,
  Button,
  Box,
  Text,
  Stack,
  Alert,
  Select,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { useOrg } from "../redux/hooks/useOrg";
// import { useProj } from "../redux/hooks/useProj";

export default function CreateProj({ opened, onClose}) {
  const [formData, setFormData] = useState({
    organizationId: null,
    name: "",
    description: "",
    projectStatus: null,
    projectPriority: null,
    startDate: null,
    endDate: null,
    teamLeadEmail: "",
  });

  const  {selectedOrganization} = useOrg();

  useEffect(() => {
    if (selectedOrganization) {
      setFormData((prev) => ({
        ...prev,
        organizationId: selectedOrganization.id,
      }));
    }
  }, [selectedOrganization]);

  const [errorMsg, setErrorMsg] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Project Status options
  const projectStatusOptions = [
    { value: "PLANNING", label: "Planning" },
    { value: "ACTIVE", label: "Active" },
    { value: "COMPLETED", label: "Completed" },
    { value: "ON_HOLD", label: "On Hold" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  // Project Priority options
  const projectPriorityOptions = [
    { value: "LOW", label: "Low" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HIGH", label: "High" },
  ];

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field-specific error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!formData.organizationId) {
      errors.organizationId = "Organization is required";
    }

    if (!formData.name?.trim()) {
      errors.name = "Project name is required";
    }

    if (!formData.startDate) {
      errors.startDate = "Start date is required";
    } else {
      const startDate = new Date(formData.startDate);
      startDate.setHours(0, 0, 0, 0);
      if (startDate < today) {
        errors.startDate = "Start date cannot be in the past";
      }
    }

    if (!formData.endDate) {
      errors.endDate = "End date is required";
    } else if (formData.startDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (endDate <= startDate) {
        errors.endDate = "End date must be after start date";
      }
    }

    if (!formData.teamLeadEmail?.trim()) {
      errors.teamLeadEmail = "Team lead email is required";
    } else {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.teamLeadEmail)) {
        errors.teamLeadEmail = "Please enter a valid email address";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    setErrorMsg(null);

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Prepare payload (format dates as YYYY-MM-DD)
      const payload = {
        organizationId: parseInt(formData.organizationId),
        name: formData.name.trim(),
        description: formData.description.trim() || "",
        projectStatus: formData.projectStatus || null,
        projectPriority: formData.projectPriority || null,
        startDate: formData.startDate
          ? new Date(formData.startDate).toISOString().split("T")[0]
          : null,
        endDate: formData.endDate
          ? new Date(formData.endDate).toISOString().split("T")[0]
          : null,
        teamLeadEmail: formData.teamLeadEmail.trim(),
      };

      // TODO: API call will be implemented later
      console.log("Project payload:", payload);

      // Show success notification
      notifications.show({
        title: "Success",
        message: "Project created successfully!",
        color: "green",
      });

      // Close modal and reset form
      onClose();
      resetForm();
    } catch (error) {
      const errorMessage = error?.message || "Failed to create project";
      setErrorMsg(errorMessage);

      notifications.show({
        title: "Error",
        message: errorMessage,
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      organizationId: null,
      name: "",
      description: "",
      projectStatus: null,
      projectPriority: null,
      startDate: null,
      endDate: null,
      teamLeadEmail: "",
    });
    setErrorMsg(null);
    setFieldErrors({});
  };

  // Check if form is valid
  const isValid =
    formData.organizationId &&
    formData.name?.trim() &&
    formData.startDate &&
    formData.endDate &&
    formData.teamLeadEmail?.trim();

  return (
    <Modal
      opened={opened}
      onClose={() => {
        onClose();
        resetForm();
      }}
      title="Create project"
      size="lg"
      centered
      styles={{
        title: {
          fontSize: "1.25rem",
          fontWeight: 600,
        },
      }}
    >
      {errorMsg && (
        <Alert color="red" mb="md" withCloseButton onClose={() => setErrorMsg(null)}>
          {errorMsg}
        </Alert>
      )}

      <Stack gap="lg">
        {/* Project Name */}
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
          placeholder="Enter project description (optional)"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          size="md"
          minRows={3}
          maxRows={6}
        />

        {/* Status and Priority in a row */}
        <Box
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          {/* Project Status */}
          <Select
            label="Status"
            placeholder="Select status"
            value={formData.projectStatus}
            onChange={(value) => handleChange("projectStatus", value)}
            data={projectStatusOptions}
            size="md"
            clearable
          />

          {/* Project Priority */}
          <Select
            label="Priority"
            placeholder="Select priority"
            value={formData.projectPriority}
            onChange={(value) => handleChange("projectPriority", value)}
            data={projectPriorityOptions}
            size="md"
            clearable
          />
        </Box>

        {/* Start and End Date in a row */}
        <Box
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          {/* Start Date */}
          <DateInput
            label="Start Date"
            placeholder="Select start date"
            value={formData.startDate}
            onChange={(value) => handleChange("startDate", value)}
            required
            size="md"
            minDate={new Date()}
            error={fieldErrors.startDate}
            valueFormat="YYYY-MM-DD"
          />

          {/* End Date */}
          <DateInput
            label="End Date"
            placeholder="Select end date"
            value={formData.endDate}
            onChange={(value) => handleChange("endDate", value)}
            required
            size="md"
            minDate={formData.startDate || new Date()}
            error={fieldErrors.endDate}
            valueFormat="YYYY-MM-DD"
          />
        </Box>

        {/* Team Lead Email */}
        <TextInput
          label="Team Lead Email"
          placeholder="teamlead@example.com"
          value={formData.teamLeadEmail}
          onChange={(e) => handleChange("teamLeadEmail", e.target.value)}
          required
          size="md"
          type="email"
          error={fieldErrors.teamLeadEmail}
          description="Team lead must be a member of the organization"
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
          Create project
        </Button>
      </Stack>
    </Modal>
  );
}
