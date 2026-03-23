import { useState } from "react";
import { Alert, Badge, Modal, Paper, Stack, Text } from "@mantine/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";

const STATUS_COLOR = {
	TODO: "#64748b",
	IN_PROGRESS: "#2563eb",
	COMPLETED: "#16a34a",
};

const toCalendarEvent = (task) => {
	if (!task?.dueDate) return null;

	return {
		id: String(task.id),
		title: task.title,
		date: task.dueDate,
		backgroundColor: STATUS_COLOR[task.status] || "#64748b",
		borderColor: STATUS_COLOR[task.status] || "#64748b",
		extendedProps: {
			status: task.status,
			priority: task.priority,
			assigneeName: task.assigneeName,
			assigneeEmail: task.assigneeEmail,
			description: task.description,
		},
	};
};

export default function Calender({ tasks = [] }) {
	const events = tasks.map(toCalendarEvent);
	const [selectedEvent, setSelectedEvent] = useState(null);

	const handleEventClick = (clickInfo) => {
		setSelectedEvent(clickInfo.event);
	};

	const handleCloseDetails = () => {
		setSelectedEvent(null);
	};

	const handleEventMouseEnter = (mouseEnterInfo) => {
		mouseEnterInfo.el.style.cursor = "pointer";
		mouseEnterInfo.el.style.transform = "translateY(-1px)";
		mouseEnterInfo.el.style.boxShadow = "0 8px 20px rgba(15, 23, 42, 0.18)";
		mouseEnterInfo.el.style.filter = "brightness(1.04)";
	};

	const handleEventMouseLeave = (mouseLeaveInfo) => {
		mouseLeaveInfo.el.style.transform = "";
		mouseLeaveInfo.el.style.boxShadow = "";
		mouseLeaveInfo.el.style.filter = "";
	};

	const handleEventDidMount = (eventMountInfo) => {
		eventMountInfo.el.style.transition = "transform 120ms ease, box-shadow 120ms ease, filter 120ms ease";
	};

	return (
		<>
			<Paper radius="lg" withBorder p="md" className="border-gray-100 bg-white">
				{events.length === 0 && (
					<Alert color="blue" mb="md">
						No tasks with due dates are available to show in calendar view.
					</Alert>
				)}

				<FullCalendar
					plugins={[dayGridPlugin]}
					initialView="dayGridMonth"
					headerToolbar={{
						left: "prev,next today",
						center: "title",
						right: "dayGridMonth",
					}}
					events={events}
					eventClick={handleEventClick}
					eventDidMount={handleEventDidMount}
					eventMouseEnter={handleEventMouseEnter}
					eventMouseLeave={handleEventMouseLeave}
					dayMaxEvents={2}
					height="auto"
				/>
			</Paper>

			<Modal
				opened={!!selectedEvent}
				onClose={handleCloseDetails}
				centered
				title={<Text fw={700}>Task Details</Text>}
			>
				{selectedEvent && (
					<Stack gap="sm">
						<Text fw={600}>{selectedEvent.title}</Text>
						<Text size="sm" c="dimmed">
							Due: {selectedEvent.start ? selectedEvent.start.toLocaleDateString() : "-"}
						</Text>
						<Badge radius="sm" variant="light">
							{selectedEvent.extendedProps?.status || "Unknown status"}
						</Badge>
						<Text size="sm">
							Priority: {selectedEvent.extendedProps?.priority || "-"}
						</Text>
						<Text size="sm">
							Assignee: {selectedEvent.extendedProps?.assigneeName || selectedEvent.extendedProps?.assigneeEmail || "Unassigned"}
						</Text>
						{selectedEvent.extendedProps?.description && (
							<Text size="sm" c="dimmed">
								{selectedEvent.extendedProps.description}
							</Text>
						)}
					</Stack>
				)}
			</Modal>
		</>
	);
}



