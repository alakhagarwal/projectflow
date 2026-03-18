import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Paper, Group, Text, Badge, Button, Select, Table } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useProj } from "../redux/hooks/useProj";
import { useTask } from "../redux/hooks/useTask";
import CreateTask from "./CreateTask";
import ManageProjectMembers from "./ManageProjectMembers";

const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
);

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const TasksTabIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

const CalendarTabIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const AnalyticsTabIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const SettingsTabIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

const BoltIcon = ({ color = "currentColor" }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const TASK_STATUS_COLOR = {
  TODO: "bg-slate-100 text-slate-700",
  IN_PROGRESS: "bg-blue-50 text-blue-700",
  IN_REVIEW: "bg-yellow-50 text-yellow-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-red-50 text-red-700",
};

const TASK_PRIORITY_COLOR = {
  LOW: "bg-emerald-50 text-emerald-700",
  MEDIUM: "bg-yellow-50 text-yellow-700",
  HIGH: "bg-orange-50 text-orange-700",
  CRITICAL: "bg-red-50 text-red-700",
};

const PROJECT_STATUS_CLASS = {
  PLANNING: "bg-slate-400 text-white",
  ACTIVE: "bg-blue-500 text-white",
  COMPLETED: "bg-emerald-500 text-white",
  ON_HOLD: "bg-yellow-500 text-white",
  CANCELLED: "bg-red-500 text-white",
};

const TABS = [
  { id: "tasks", label: "Tasks", icon: <TasksTabIcon /> },
  { id: "calendar", label: "Calendar", icon: <CalendarTabIcon /> },
  { id: "analytics", label: "Analytics", icon: <AnalyticsTabIcon /> },
  { id: "settings", label: "Settings", icon: <SettingsTabIcon /> },
];

const formatEnumLabel = (value) => {
  if (!value) return "-";
  return value
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
};

function ProjectStatCard({ title, value, icon, valueClassName = "text-slate-900" }) {
  return (
    <Paper
      radius="lg"
      p="lg"
      className="border border-gray-100"
    >
      <Group justify="space-between" align="flex-start">
        <Box>
          <Text size="sm" c="dimmed" fw={500}>
            {title}
          </Text>
          <Text size="2rem" fw={700} mt={4} className={valueClassName}>
            {value}
          </Text>
        </Box>
        <Box className="text-slate-800">{icon}</Box>
      </Group>
    </Paper>
  );
}

function FilterSelect({ value, onChange, options, placeholder }) {
  return (
    <Select
      value={value}
      onChange={onChange}
      data={options}
      placeholder={placeholder}
      clearable
      size="sm"
      radius="md"
      style={{ minWidth: 190 }}
    />
  );
}

function TasksView({ tasks }) {
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");

  const filtered = useMemo(() => {
    return (tasks || []).filter((task) => {
      if (statusFilter && task.status !== statusFilter) return false;
      if (typeFilter && task.taskType !== typeFilter) return false;
      if (priorityFilter && task.priority !== priorityFilter) return false;
      if (assigneeFilter && String(task.assigneeId) !== assigneeFilter) return false;
      return true;
    });
  }, [assigneeFilter, priorityFilter, statusFilter, tasks, typeFilter]);

  const assigneeOptions = useMemo(() => {
    const seen = new Set();
    const options = [];

    (tasks || []).forEach((task) => {
      if (task.assigneeId && !seen.has(task.assigneeId)) {
        seen.add(task.assigneeId);
        options.push({
          value: String(task.assigneeId),
          label: task.assigneeName || `User ${task.assigneeId}`,
        });
      }
    });

    return options;
  }, [tasks]);

  return (
    <Box>
      <Box mb={20} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="All Statuses"
          options={[
            { value: "TODO", label: "To Do" },
            { value: "IN_PROGRESS", label: "In Progress" },
            { value: "IN_REVIEW", label: "In Review" },
            { value: "COMPLETED", label: "Completed" },
            { value: "CANCELLED", label: "Cancelled" },
          ]}
        />
        <FilterSelect
          value={typeFilter}
          onChange={setTypeFilter}
          placeholder="All Types"
          options={[
            { value: "FEATURE", label: "Feature" },
            { value: "BUG", label: "Bug" },
            { value: "IMPROVEMENT", label: "Improvement" },
            { value: "TASK", label: "Task" },
          ]}
        />
        <FilterSelect
          value={priorityFilter}
          onChange={setPriorityFilter}
          placeholder="All Priorities"
          options={[
            { value: "LOW", label: "Low" },
            { value: "MEDIUM", label: "Medium" },
            { value: "HIGH", label: "High" },
            { value: "CRITICAL", label: "Critical" },
          ]}
        />
        <FilterSelect
          value={assigneeFilter}
          onChange={setAssigneeFilter}
          placeholder="All Assignees"
          options={assigneeOptions}
        />
      </Box>

      <Paper radius="lg" withBorder className="border-gray-100 overflow-hidden">
        <Box className="overflow-x-auto">
          <Table highlightOnHover verticalSpacing="md">
            <Table.Thead className="bg-gray-50">
              <Table.Tr>
                <Table.Th style={{ width: 32 }} />
                <Table.Th>Title</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Priority</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Assignee</Table.Th>
                <Table.Th>Due date</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtered.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={7}>
                    <Text c="dimmed" ta="center" py="lg">
                      No tasks found for the selected filters.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                filtered.map((task) => (
                  <Table.Tr key={task.id}>
                    <Table.Td>
                      <Box className="h-2.5 w-2.5 rounded-full bg-blue-400" />
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={500} lineClamp={1}>
                        {task.title}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {formatEnumLabel(task.taskType)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        size="sm"
                        radius="sm"
                        className={TASK_PRIORITY_COLOR[task.priority] || "bg-slate-100 text-slate-700"}
                      >
                        {formatEnumLabel(task.priority)}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        size="sm"
                        radius="sm"
                        className={TASK_STATUS_COLOR[task.status] || "bg-slate-100 text-slate-700"}
                      >
                        {formatEnumLabel(task.status)}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {task.assigneeName || "Unassigned"}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </Box>
      </Paper>
    </Box>
  );
}

function ComingSoonPanel({ icon, title }) {
  return (
    <Paper radius="lg" withBorder p="xl" className="border-slate-200 bg-white">
      <Box py={40} className="flex flex-col items-center justify-center text-center">
        <Box mb={16} p={24} className="rounded-2xl bg-slate-100 text-slate-500">{icon}</Box>
        <p className="text-lg font-medium text-slate-700">{title} - coming soon</p>
      </Box>
    </Paper>
  );
}

export default function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects } = useProj();
  const { tasks } = useTask();

  const [activeTab, setActiveTab] = useState("tasks");
  const [createTaskOpened, setCreateTaskOpened] = useState(false);
  const [manageMembersOpened, setManageMembersOpened] = useState(false);

  const project = useMemo(
    () => (projects || []).find((item) => String(item.id) === String(projectId)),
    [projectId, projects]
  );

  const completedCount = useMemo(
    () => (tasks || []).filter((task) => task.status === "COMPLETED").length,
    [tasks]
  );

  const inProgressCount = useMemo(
    () => (tasks || []).filter((task) => task.status === "IN_PROGRESS").length,
    [tasks]
  );

  const teamMemberCount = project?.memberCount || 1;

  const stats = [
    {
      title: "Total Tasks",
      value: tasks?.length ?? 0,
      icon: <BoltIcon />,
      valueClassName: "text-slate-900",
    },
    {
      title: "Completed",
      value: completedCount,
      icon: <BoltIcon color="#22c55e" />,
      valueClassName: "text-emerald-700",
    },
    {
      title: "In Progress",
      value: inProgressCount,
      icon: <BoltIcon color="#f97316" />,
      valueClassName: "text-orange-700",
    },
    {
      title: "Team Members",
      value: teamMemberCount,
      icon: <BoltIcon color="#3b82f6" />,
      valueClassName: "text-blue-600",
    },
  ];

  const handleCreateTaskSubmit = (taskPayload) => {
    // Endpoint integration placeholder:
    // dispatch(createTask({ projectId, taskData: taskPayload }))
    console.log("Create task submit placeholder:", {
      projectId,
      taskPayload,
    });
    setCreateTaskOpened(false);
  };

  return (
    <Box p={30} className="flex-1 bg-slate-50 overflow-auto">
      <Group justify="space-between" align="center" mb={32}>
        <Group gap="sm" align="center">
          <Button
            variant="subtle"
            color="gray"
            size="sm"
            px={8}
            onClick={() => navigate(-1)}
          >
            <ArrowLeftIcon />
          </Button>
          <Box>
            <Group gap="sm" align="center">
              <Text size="2rem" fw={700} className="text-slate-950">
                {project?.name ?? "Project"}
              </Text>
              {project?.projectStatus && (
                <Badge
                  radius="sm"
                  className={PROJECT_STATUS_CLASS[project.projectStatus] || "bg-slate-400 text-white"}
                >
                  {formatEnumLabel(project.projectStatus)}
                </Badge>
              )}
            </Group>
          </Box>
        </Group>

        <Group gap="sm">
          <Button
            variant="default"
            radius="md"
            onClick={() => setManageMembersOpened(true)}
          >
            Manage Members
          </Button>

          <Button
            leftSection={<PlusIcon />}
            radius="md"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setCreateTaskOpened(true)}
          >
            New Task
          </Button>
        </Group>
      </Group>

      <Box
        mb={32}
        className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        {stats.map((stat, index) => (
          <ProjectStatCard key={index} {...stat} />
        ))}
      </Box>

      <Box
        mb={24}
        p={4}
        className="inline-flex flex-wrap"
        style={{ border: "1px solid #e2e8f0", borderRadius: 8, background: "#ffffff" }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              whiteSpace: "nowrap",
              borderRadius: 6,
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 500,
              color: activeTab === tab.id ? "#0f172a" : "#334155",
              background: activeTab === tab.id ? "#f1f5f9" : "transparent",
              transition: "background-color 0.2s ease, color 0.2s ease",
              cursor: "pointer",
              border: "none",
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </Box>

      {activeTab === "tasks" && <TasksView tasks={tasks} />}
      {activeTab === "calendar" && <ComingSoonPanel icon={<CalendarTabIcon />} title="Calendar" />}
      {activeTab === "analytics" && <ComingSoonPanel icon={<AnalyticsTabIcon />} title="Analytics" />}
      {activeTab === "settings" && <ComingSoonPanel icon={<SettingsTabIcon />} title="Settings" />}

      <CreateTask
        opened={createTaskOpened}
        onClose={() => setCreateTaskOpened(false)}
        onSubmit={handleCreateTaskSubmit}
        projectName={project?.name}
      />

      <ManageProjectMembers
        opened={manageMembersOpened}
        onClose={() => setManageMembersOpened(false)}
        projectId={projectId}
        projectName={project?.name}
      />
    </Box>
  );
}

