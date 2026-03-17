import { useMemo, useState } from "react";
import {
	Modal,
	Text,
	TextInput,
	Textarea,
	Select,
	Group,
	Button,
	Stack,
} from "@mantine/core";

const TASK_TYPE_OPTIONS = [
	{ value: "TASK", label: "Task" },
	{ value: "FEATURE", label: "Feature" },
	{ value: "BUG", label: "Bug" },
	{ value: "IMPROVEMENT", label: "Improvement" },
	{ value: "OTHER", label: "Other" },
];

const TASK_PRIORITY_OPTIONS = [
	{ value: "LOW", label: "Low" },
	{ value: "MEDIUM", label: "Medium" },
	{ value: "HIGH", label: "High" },
];

const TASK_STATUS_OPTIONS = [
	{ value: "TO_DO", label: "To Do" },
	{ value: "IN_PROGRESS", label: "In Progress" },
	{ value: "DONE", label: "Done" },
];

const getTomorrowDate = () => {
	const date = new Date();
	date.setDate(date.getDate() + 1);
	return date.toISOString().split("T")[0];
};

const initialFormState = {
	title: "",
	description: "",
	taskType: "TASK",
	taskPriority: "MEDIUM",
	taskStatus: "TO_DO",
	assignedToEmail: "",
	dueDate: "",
};

export default function CreateTask({
	opened,
	onClose,
	onSubmit,
	assigneeOptions = [],
	projectName,
}) {
	const [formData, setFormData] = useState(initialFormState);

	const mergedAssigneeOptions = useMemo(
		() => [{ value: "", label: "Unassigned" }, ...assigneeOptions],
		[assigneeOptions]
	);

	const handleChange = (field, value) => {
		setFormData((prev) => ({ ...prev, [field]: value ?? "" }));
	};

	const handleClose = () => {
		setFormData(initialFormState);
		onClose();
	};

	const handleSubmit = (event) => {
		event.preventDefault();

		// Endpoint integration hook: parent can dispatch create task thunk here.
		if (onSubmit) {
			onSubmit({
				...formData,
				dueDate: formData.dueDate || null,
				assignedToEmail: formData.assignedToEmail || null,
			});
			return;
		}

		// Temporary placeholder while endpoint integration is pending.
		console.log("Create task payload (placeholder):", formData);
	};

	return (
		<Modal
			opened={opened}
			onClose={handleClose}
			centered
			radius="md"
			size={720}
			title={
				<Text fw={700} size="1.55rem" className="text-slate-900">
					Create New Task{projectName ? ` - ${projectName}` : ""}
				</Text>
			}
		>
			<form onSubmit={handleSubmit}>
				<Stack gap="md" mt="sm">
					<TextInput
						label="Title"
						placeholder="Task title"
						value={formData.title}
						onChange={(event) => handleChange("title", event.currentTarget.value)}
						required
						radius="md"
					/>

					<Textarea
						label="Description"
						placeholder="Describe the task"
						minRows={4}
						value={formData.description}
						onChange={(event) => handleChange("description", event.currentTarget.value)}
						required
						radius="md"
					/>

					<Group grow>
						<Select
							label="Type"
							data={TASK_TYPE_OPTIONS}
							value={formData.taskType}
							onChange={(value) => handleChange("taskType", value)}
							radius="md"
							allowDeselect={false}
						/>
						<Select
							label="Priority"
							data={TASK_PRIORITY_OPTIONS}
							value={formData.taskPriority}
							onChange={(value) => handleChange("taskPriority", value)}
							radius="md"
							allowDeselect={false}
						/>
					</Group>

					<Group grow>
						<Select
							label="Assignee"
							data={mergedAssigneeOptions}
							value={formData.assignedToEmail}
							onChange={(value) => handleChange("assignedToEmail", value)}
							radius="md"
						/>
						<Select
							label="Status"
							data={TASK_STATUS_OPTIONS}
							value={formData.taskStatus}
							onChange={(value) => handleChange("taskStatus", value)}
							radius="md"
							allowDeselect={false}
						/>
					</Group>

					<TextInput
						label="Due Date"
						placeholder="mm/dd/yyyy"
						type="date"
						min={getTomorrowDate()}
						value={formData.dueDate}
						onChange={(event) => handleChange("dueDate", event.currentTarget.value)}
						radius="md"
					/>

					<Group justify="flex-end" mt="md">
						<Button variant="default" onClick={handleClose}>
							Cancel
						</Button>
						<Button type="submit" className="bg-blue-600 hover:bg-blue-700">
							Create Task
						</Button>
					</Group>
				</Stack>
			</form>
		</Modal>
	);
}
