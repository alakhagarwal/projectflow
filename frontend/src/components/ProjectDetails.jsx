import { useState, useMemo } from "react";
import {
  Box,
  Text,
  Button,
  Paper,
  Group,
  Badge,
  Select,
} from "@mantine/core";
import { useNavigate, useParams } from "react-router-dom";
import { useProj } from "../redux/hooks/useProj";
import { useTask } from "../redux/hooks/useTask";
import StatsCard from "./StatsCard";

// ── Icons ──────────────────────────────────────────────────────────────────────
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

// ── Helpers ────────────────────────────────────────────────────────────────────
const PROJECT_STATUS_COLOR = {
  PLANNING: "gray",
  ACTIVE: "blue",
  COMPLETED: "green",
  ON_HOLD: "yellow",
  CANCELLED: "red",
};



// ── Task table ─────────────────────────────────────────────────────────────────
const TASK_STATUS_COLOR = {
  TODO: "gray",
  IN_PROGRESS: "blue",
  IN_REVIEW: "yellow",
  COMPLETED: "green",
  CANCELLED: "red",
};

const TASK_PRIORITY_COLOR = {
  LOW: "green",
  MEDIUM: "yellow",
  HIGH: "orange",
  CRITICAL: "red",
};

function TasksView({ tasks, onNewTask }) {
  const [statusFilter, setStatusFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState(null);
  const [assigneeFilter, setAssigneeFilter] = useState(null);

  const filtered = useMemo(() => {
    return (tasks || []).filter((t) => {
      if (statusFilter && t.status !== statusFilter) return false;
      if (typeFilter && t.taskType !== typeFilter) return false;
      if (priorityFilter && t.priority !== priorityFilter) return false;
      if (assigneeFilter && String(t.assigneeId) !== assigneeFilter) return false;
      return true;
    });
  }, [tasks, statusFilter, typeFilter, priorityFilter, assigneeFilter]);

  const assigneeOptions = useMemo(() => {
    const seen = new Set();
    const opts = [];
    (tasks || []).forEach((t) => {
      if (t.assigneeId && !seen.has(t.assigneeId)) {
        seen.add(t.assigneeId);
        opts.push({ value: String(t.assigneeId), label: t.assigneeName || `User ${t.assigneeId}` });
      }
    });
    return opts;
  }, [tasks]);

  return (
    <Box>
      {/* Filter row */}
      <Group gap="sm" mb="lg" wrap="wrap">
        <Select
          placeholder="All Statuses"
          data={[
            { value: "TODO", label: "To Do" },
            { value: "IN_PROGRESS", label: "In Progress" },
            { value: "IN_REVIEW", label: "In Review" },
            { value: "COMPLETED", label: "Completed" },
            { value: "CANCELLED", label: "Cancelled" },
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
          clearable
          size="sm"
          radius="md"
          styles={{ input: { minWidth: 130 } }}
        />
        <Select
          placeholder="All Types"
          data={[
            { value: "FEATURE", label: "Feature" },
            { value: "BUG", label: "Bug" },
            { value: "IMPROVEMENT", label: "Improvement" },
            { value: "TASK", label: "Task" },
          ]}
          value={typeFilter}
          onChange={setTypeFilter}
          clearable
          size="sm"
          radius="md"
          styles={{ input: { minWidth: 120 } }}
        />
        <Select
          placeholder="All Priorities"
          data={[
            { value: "LOW", label: "Low" },
            { value: "MEDIUM", label: "Medium" },
            { value: "HIGH", label: "High" },
            { value: "CRITICAL", label: "Critical" },
          ]}
          value={priorityFilter}
          onChange={setPriorityFilter}
          clearable
          size="sm"
          radius="md"
          styles={{ input: { minWidth: 130 } }}
        />
        <Select
          placeholder="All Assignees"
          data={assigneeOptions}
          value={assigneeFilter}
          onChange={setAssigneeFilter}
          clearable
          size="sm"
          radius="md"
          styles={{ input: { minWidth: 140 } }}
        />
      </Group>

      {/* Table */}
      <Paper radius="lg" className="border border-gray-100 overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[32px_2fr_1fr_1fr_1fr_1fr_1fr] gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
          </div>
          {["TITLE", "TYPE", "PRIORITY", "STATUS", "ASSIGNEE", "DUE DATE"].map((col) => (
            <Text key={col} size="xs" fw={700} c="dimmed" className="tracking-wide">
              {col}
            </Text>
          ))}
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <Box className="flex items-center justify-center py-16">
            <Text c="dimmed" size="sm">No tasks found for the selected filters.</Text>
          </Box>
        ) : (
          filtered.map((task) => (
            <div
              key={task.id}
              className="grid grid-cols-[32px_2fr_1fr_1fr_1fr_1fr_1fr] gap-3 px-5 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer items-center"
            >
              <div className="flex items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              </div>
              <Text size="sm" fw={500} className="text-gray-800 truncate">{task.title}</Text>
              <Text size="sm" c="dimmed" className="truncate">
                {task.taskType ? task.taskType.charAt(0) + task.taskType.slice(1).toLowerCase() : "—"}
              </Text>
              <Badge
                size="sm"
                variant="light"
                color={TASK_PRIORITY_COLOR[task.priority] || "gray"}
              >
                {task.priority ? task.priority.charAt(0) + task.priority.slice(1).toLowerCase() : "—"}
              </Badge>
              <Badge
                size="sm"
                variant="light"
                color={TASK_STATUS_COLOR[task.status] || "gray"}
              >
                {task.status ? task.status.replace("_", " ") : "—"}
              </Badge>
              <Text size="sm" c="dimmed">{task.assigneeName || "Unassigned"}</Text>
              <Text size="sm" c="dimmed">
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
              </Text>
            </div>
          ))
        )}
      </Paper>
    </Box>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
const TABS = [
  { id: "tasks", label: "Tasks", icon: <TasksTabIcon /> },
  { id: "calendar", label: "Calendar", icon: <CalendarTabIcon /> },
  { id: "analytics", label: "Analytics", icon: <AnalyticsTabIcon /> },
  { id: "settings", label: "Settings", icon: <SettingsTabIcon /> },
];

export default function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects } = useProj();
  const { tasks } = useTask();

  const [activeTab, setActiveTab] = useState("tasks");
  const [newTaskOpen, setNewTaskOpen] = useState(false);

  const project = useMemo(
    () => (projects || []).find((p) => String(p.id) === String(projectId)),
    [projects, projectId]
  );

  const completedCount = useMemo(
    () => (tasks || []).filter((t) => t.status === "COMPLETED").length,
    [tasks]
  );
  const inProgressCount = useMemo(
    () => (tasks || []).filter((t) => t.status === "IN_PROGRESS").length,
    [tasks]
  );

  // Placeholder team-member count (will be wired up later)
  const teamMemberCount = project?.memberCount ?? 1;

  const stats = [
    {
      title: "Total Tasks",
      value: tasks?.length ?? 0,
      subtitle: "tasks in project",
      icon: <BoltIcon />,
      color: "blue",
    },
    {
      title: "Completed",
      value: completedCount,
      subtitle: "tasks done",
      icon: <BoltIcon color="#22c55e" />,
      color: "green",
    },
    {
      title: "In Progress",
      value: inProgressCount,
      subtitle: "being worked on",
      icon: <BoltIcon color="#f97316" />,
      color: "orange",
    },
    {
      title: "Team Members",
      value: teamMemberCount,
      subtitle: "on this project",
      icon: <BoltIcon color="#3b82f6" />,
      color: "blue",
    },
  ];

  return (
    <Box p={30} className="flex-1 bg-slate-50 overflow-auto min-h-screen">
      {/* ── Page header ── */}
      <Group justify="space-between" align="center" mb="xl">
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
          <Text size="xl" fw={700} className="text-gray-900">
            {project?.name ?? "Project"}
          </Text>
          {project?.projectStatus && (
            <Badge
              variant="outline"
              color={PROJECT_STATUS_COLOR[project.projectStatus] || "gray"}
              size="md"
              radius="sm"
            >
              {project.projectStatus}
            </Badge>
          )}
        </Group>

        <Button
          leftSection={<PlusIcon />}
          size="md"
          radius="md"
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setNewTaskOpen(true)}
        >
          New Task
        </Button>
      </Group>

      {/* ── Stats row ── */}
      <Box mb="xl" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatsCard key={i} {...stat} />
        ))}
      </Box>

      {/* ── Tab bar ── */}
      <Box mb="lg">
        <Group gap={0} className="border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px
                ${activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </Group>
      </Box>

      {/* ── Tab content ── */}
      {activeTab === "tasks" && (
        <TasksView tasks={tasks} onNewTask={() => setNewTaskOpen(true)} />
      )}

      {activeTab === "calendar" && (
        <Paper p="xl" radius="lg" className="border border-gray-100">
          <Box className="flex flex-col items-center justify-center py-16">
            <Box className="p-6 bg-slate-100 rounded-2xl mb-4">
              <CalendarTabIcon />
            </Box>
            <Text c="dimmed" size="lg">Calendar — coming soon</Text>
          </Box>
        </Paper>
      )}

      {activeTab === "analytics" && (
        <Paper p="xl" radius="lg" className="border border-gray-100">
          <Box className="flex flex-col items-center justify-center py-16">
            <Box className="p-6 bg-slate-100 rounded-2xl mb-4">
              <AnalyticsTabIcon />
            </Box>
            <Text c="dimmed" size="lg">Analytics — coming soon</Text>
          </Box>
        </Paper>
      )}

      {activeTab === "settings" && (
        <Paper p="xl" radius="lg" className="border border-gray-100">
          <Box className="flex flex-col items-center justify-center py-16">
            <Box className="p-6 bg-slate-100 rounded-2xl mb-4">
              <SettingsTabIcon />
            </Box>
            <Text c="dimmed" size="lg">Settings — coming soon</Text>
          </Box>
        </Paper>
      )}
    </Box>
  );
}

