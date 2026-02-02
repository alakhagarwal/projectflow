import { Paper, Text, Group, Box } from "@mantine/core";

export default function StatsCard({ title, value, subtitle, icon, color = "blue" }) {
  const colorMap = {
    blue: { bg: "bg-blue-50", text: "text-blue-500" },
    green: { bg: "bg-green-50", text: "text-green-500" },
    purple: { bg: "bg-purple-50", text: "text-purple-500" },
    orange: { bg: "bg-orange-50", text: "text-orange-500" },
  };

  const colors = colorMap[color] || colorMap.blue;

  return (
    <Paper
      p="lg"
      radius="lg"
      className="border border-gray-100 hover:shadow-md transition-shadow"
    >
      <Group justify="space-between" align="flex-start">
        <Box>
          <Text size="sm" c="dimmed" fw={500}>
            {title}
          </Text>
          <Text size="2rem" fw={700} className="text-gray-900 mt-1">
            {value}
          </Text>
          <Text size="xs" c="dimmed" mt={4}>
            {subtitle}
          </Text>
        </Box>
        <Box className={`p-3 rounded-xl ${colors.bg}`}>
          <Box className={colors.text}>{icon}</Box>
        </Box>
      </Group>
    </Paper>
  );
}
