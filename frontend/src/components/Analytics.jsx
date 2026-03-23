import { useMemo } from "react";
import { Box, Paper, Text, Group, SimpleGrid, Progress, Badge } from "@mantine/core";
import {
	ResponsiveContainer,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	PieChart,
	Pie,
	Cell,
	Legend,
} from "recharts";

const STATUS_ORDER = ["TODO", "IN_PROGRESS", "COMPLETED"];
const PRIORITY_ORDER = ["LOW", "MEDIUM", "HIGH"];

const STATUS_COLOR = {
	TODO: "#94A3B8",
	IN_PROGRESS: "#3B82F6",
	COMPLETED: "#10B981",
};

const PRIORITY_COLOR = {
	LOW: "#EF4444",
	MEDIUM: "#3B82F6",
	HIGH: "#10B981",
};

const TYPE_COLOR = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#06B6D4"];

const formatLabel = (value) => {
	if (!value) return "-";
	if (value === "IN_PROGRESS") return "IN PROGRESS";
	if (value === "COMPLETED") return "DONE";
	return value;
};

const StatIcon = ({ color = "#64748B", path }) => (
	<Box
		className="inline-flex items-center justify-center rounded-lg"
		style={{ width: 32, height: 32, background: `${color}1A`, color }}
	>
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d={path} />
		</svg>
	</Box>
);

function MetricCard({ title, value, icon, color = "#0F172A" }) {
	return (
		<Paper p="md" radius="md" withBorder>
			<Group justify="space-between" align="center">
				<Box>
					<Text size="sm" c="dimmed" fw={600}>{title}</Text>
					<Text size="1.9rem" fw={700} c={color} lh={1.1} mt={4}>{value}</Text>
				</Box>
				{icon}
			</Group>
		</Paper>
	);
}

export default function Analytics({ tasks = [], members = [], loading = false, project = null }) {
	const today = useMemo(() => {
		const now = new Date();
		now.setHours(0, 0, 0, 0);
		return now;
	}, []);

	const statusCounts = useMemo(() => {
		const counts = { TODO: 0, IN_PROGRESS: 0, COMPLETED: 0 };
		(tasks || []).forEach((task) => {
			const status = task?.status;
			if (counts[status] !== undefined) counts[status] += 1;
		});
		return counts;
	}, [tasks]);

	const typeCounts = useMemo(() => {
		const counts = {};
		(tasks || []).forEach((task) => {
			const type = task?.taskType || "OTHER";
			counts[type] = (counts[type] || 0) + 1;
		});
		return counts;
	}, [tasks]);

	const priorityCounts = useMemo(() => {
		const counts = { LOW: 0, MEDIUM: 0, HIGH: 0 };
		(tasks || []).forEach((task) => {
			const priority = task?.priority;
			if (counts[priority] !== undefined) counts[priority] += 1;
		});
		return counts;
	}, [tasks]);

	const completionRate = useMemo(() => {
		if (!tasks?.length) return 0;
		return Math.round((statusCounts.COMPLETED / tasks.length) * 100);
	}, [tasks, statusCounts]);

	const activeTasks = useMemo(
		() => (tasks || []).filter((task) => task?.status !== "COMPLETED").length,
		[tasks],
	);

	const overdueTasks = useMemo(
		() =>
			(tasks || []).filter((task) => {
				if (!task?.dueDate || task?.status === "COMPLETED") return false;
				const due = new Date(task.dueDate);
				due.setHours(0, 0, 0, 0);
				return due < today;
			}).length,
		[tasks, today],
	);

	const teamSize = useMemo(() => {
		if (members?.length) return members.length;
		return project?.memberCount || 0;
	}, [members, project]);

	const statusChartData = useMemo(
		() => STATUS_ORDER.map((status) => ({ status: formatLabel(status), count: statusCounts[status] || 0 })),
		[statusCounts],
	);

	const typeChartData = useMemo(() => {
		return Object.entries(typeCounts)
			.map(([type, value], index) => ({
				name: type,
				value,
				color: TYPE_COLOR[index % TYPE_COLOR.length],
			}))
			.filter((item) => item.value > 0);
	}, [typeCounts]);

	const priorityRows = useMemo(
		() =>
			PRIORITY_ORDER.map((priority) => {
				const count = priorityCounts[priority] || 0;
				const percent = tasks?.length ? Math.round((count / tasks.length) * 100) : 0;
				return { priority, count, percent };
			}),
		[priorityCounts, tasks],
	);

	if (loading) {
		return (
			<Paper p="xl" radius="lg" withBorder>
				<Text c="dimmed">Loading analytics...</Text>
			</Paper>
		);
	}

	return (
		<Box className="space-y-6">
			<SimpleGrid cols={{ base: 1, sm: 2, xl: 4 }} spacing="md">
				<MetricCard
					title="Completion Rate"
					value={`${completionRate}%`}
					color="#10B981"
					icon={<StatIcon color="#10B981" path="M20 6L9 17l-5-5" />}
				/>
				<MetricCard
					title="Active Tasks"
					value={activeTasks}
					color="#2563EB"
					icon={<StatIcon color="#3B82F6" path="M12 6v6l4 2" />}
				/>
				<MetricCard
					title="Overdue Tasks"
					value={overdueTasks}
					color="#EF4444"
					icon={<StatIcon color="#EF4444" path="M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h16.9a2 2 0 001.7-3l-8.5-14.1a2 2 0 00-3.4 0z" />}
				/>
				<MetricCard
					title="Team Size"
					value={teamSize}
					color="#8B5CF6"
					icon={<StatIcon color="#A855F7" path="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 110-8 4 4 0 010 8m14 14v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8" />}
				/>
			</SimpleGrid>

			<SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
				<Paper p="lg" radius="md" withBorder>
					<Text fw={700} size="xl" mb="md">Tasks by Status</Text>
					{tasks.length === 0 ? (
						<Text c="dimmed" ta="center" py="xl">No task data available</Text>
					) : (
						<Box h={320}>
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={statusChartData}>
									<XAxis dataKey="status" />
									<YAxis allowDecimals={false} />
									<Tooltip />
									<Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
								</BarChart>
							</ResponsiveContainer>
						</Box>
					)}
				</Paper>

				<Paper p="lg" radius="md" withBorder>
					<Text fw={700} size="xl" mb="md">Tasks by Type</Text>
					{typeChartData.length === 0 ? (
						<Text c="dimmed" ta="center" py="xl">No task type data available</Text>
					) : (
						<Box h={320}>
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={typeChartData}
										dataKey="value"
										nameKey="name"
										cx="50%"
										cy="50%"
										outerRadius={92}
										label={({ name, value }) => `${name}: ${value}`}
									>
										{typeChartData.map((entry) => (
											<Cell key={entry.name} fill={entry.color} />
										))}
									</Pie>
									<Tooltip />
									<Legend />
								</PieChart>
							</ResponsiveContainer>
						</Box>
					)}
				</Paper>
			</SimpleGrid>

			<Paper p="lg" radius="md" withBorder>
				<Text fw={700} size="xl" mb="md">Tasks by Priority</Text>
				{tasks.length === 0 ? (
					<Text c="dimmed" ta="center" py="xl">No priority data available</Text>
				) : (
					<Box className="space-y-4">
						{priorityRows.map((row) => (
							<Box key={row.priority}>
								<Group justify="space-between" mb={6} p={10}> 
									<Group gap="xs">
										<Text fw={700} c={PRIORITY_COLOR[row.priority] || "#64748B"}>→</Text>
										<Text fw={600}>{row.priority.charAt(0) + row.priority.slice(1).toLowerCase()}</Text>
									</Group>
									<Group gap="xs">
										<Text size="sm" c="dimmed">{row.count} tasks</Text>
										<Badge variant="light" color="gray">{row.percent}%</Badge>
									</Group>
								</Group>
								<Progress
									value={row.percent}
									color={
										row.priority === "LOW"
											? "red"
											: row.priority === "MEDIUM"
												? "blue"
												: "green"
									}
									size="md"
									radius="lg"
								/>
							</Box>
						))}
					</Box>
				)}
			</Paper>
		</Box>
	);
}
