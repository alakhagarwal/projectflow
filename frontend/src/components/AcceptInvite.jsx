import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Box,
  Text,
  Button,
  Center,
  Loader,
  Paper,
  ThemeIcon,
  Stack,
  Group,
} from "@mantine/core";
import api from "../config/api";

// Icons
const CheckIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ClockIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const ShieldIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

// Determine error type from message string
const getErrorType = (message) => {
  if (!message) return "generic";
  const lower = message.toLowerCase();
  if (lower.includes("expired")) return "expired";
  if (lower.includes("already accepted") || lower.includes("already active")) return "already_accepted";
  if (lower.includes("invalid") || lower.includes("not found")) return "invalid";
  return "generic";
};

const ERROR_CONFIG = {
  expired: {
    icon: <ClockIcon />,
    color: "orange",
    title: "Invitation Expired",
    description:
      "This invitation link has expired (links are valid for 7 days). Please ask the admin to send a new invitation.",
    primaryAction: "Contact Admin",
    primaryHref: null,
  },
  already_accepted: {
    icon: <CheckIcon />,
    color: "blue",
    title: "Already a Member",
    description:
      "This invitation has already been accepted. You are already a member of this organization.",
    primaryAction: "Go to Login",
    primaryHref: "/login",
  },
  invalid: {
    icon: <XIcon />,
    color: "red",
    title: "Invalid Invitation",
    description:
      "This invitation link is not valid. Please check your email for the correct link or ask the admin to resend the invitation.",
    primaryAction: "Go to Login",
    primaryHref: "/login",
  },
  generic: {
    icon: <XIcon />,
    color: "red",
    title: "Something Went Wrong",
    description: null, // Will use raw error message
    primaryAction: "Go to Login",
    primaryHref: "/login",
  },
};

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  // status: 'processing' | 'success' | 'error' | 'no_token'
  const [status, setStatus] = useState("processing");
  const [successData, setSuccessData] = useState(null); // { email, message }
  const [errorMessage, setErrorMessage] = useState("");

  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setStatus("no_token");
      return;
    }

    const accept = async () => {
      try {
        const data = await api.post(`/org/accept-invite?token=${token}`);
        setSuccessData(data);
        setStatus("success");
      } catch (err) {
        setErrorMessage(typeof err === "string" ? err : "Failed to accept invitation");
        setStatus("error");
      }
    };

    accept();
  }, [token]);

  // ─── PROCESSING ───────────────────────────────────────────────
  if (status === "processing") {
    return (
      <PageWrapper>
        <Stack align="center" gap="lg">
          <Loader size="lg" color="blue" />
          <Text fw={600} size="lg" c="gray.7">
            Processing your invitation...
          </Text>
          <Text size="sm" c="dimmed">
            Please wait while we activate your membership.
          </Text>
        </Stack>
      </PageWrapper>
    );
  }

  // ─── SUCCESS ──────────────────────────────────────────────────
  if (status === "success") {
    return (
      <PageWrapper>
        <Stack align="center" gap="lg">
          <ThemeIcon size={72} radius="xl" color="green" variant="light">
            <CheckIcon />
          </ThemeIcon>

          <Box ta="center">
            <Text fw={700} size="1.5rem" c="gray.9" mb={6}>
              Invitation Accepted!
            </Text>
            <Text size="sm" c="dimmed">
              You are now a member of the organization.
            </Text>
            {successData?.email && (
              <Text size="sm" c="dimmed" mt={4}>
                Logged in as{" "}
                <Text component="span" fw={500} c="blue">
                  {successData.email}
                </Text>
              </Text>
            )}
          </Box>

          <Box
            style={{
              backgroundColor: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: 10,
              padding: "14px 24px",
              width: "100%",
              textAlign: "center",
            }}
          >
            <Text size="sm" c="green.7" fw={500}>
              Your membership is now active. You can log in and access the
              organization from your dashboard.
            </Text>
          </Box>

          <Group gap="sm">
            <Button
              size="md"
              radius="md"
              onClick={() => navigate("/login")}
              style={{ backgroundColor: "#2563eb" }}
            >
              {isLoggedIn ? "Go to Dashboard" : "Go to Login"}
            </Button>
          </Group>
        </Stack>
      </PageWrapper>
    );
  }

  // ─── NO TOKEN ─────────────────────────────────────────────────
  if (status === "no_token") {
    return (
      <PageWrapper>
        <Stack align="center" gap="lg">
          <ThemeIcon size={72} radius="xl" color="red" variant="light">
            <XIcon />
          </ThemeIcon>

          <Box ta="center">
            <Text fw={700} size="1.5rem" c="gray.9" mb={6}>
              Invalid Invitation Link
            </Text>
            <Text size="sm" c="dimmed">
              No invitation token was found in this link. Please check your
              email and click the invitation button again.
            </Text>
          </Box>

          <Button
            size="md"
            radius="md"
            variant="outline"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </Button>
        </Stack>
      </PageWrapper>
    );
  }

  // ─── ERROR ────────────────────────────────────────────────────
  const errorType = getErrorType(errorMessage);
  const config = ERROR_CONFIG[errorType];

  return (
    <PageWrapper>
      <Stack align="center" gap="lg">
        <ThemeIcon size={72} radius="xl" color={config.color} variant="light">
          {config.icon}
        </ThemeIcon>

        <Box ta="center">
          <Text fw={700} size="1.5rem" c="gray.9" mb={6}>
            {config.title}
          </Text>
          <Text size="sm" c="dimmed">
            {config.description || errorMessage}
          </Text>
        </Box>

        {/* Raw error detail */}
        {errorMessage && (
          <Box
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 10,
              padding: "12px 20px",
              width: "100%",
              textAlign: "center",
            }}
          >
            <Text size="xs" c="red.6">
              {errorMessage}
            </Text>
          </Box>
        )}

        <Group gap="sm">
          {config.primaryHref ? (
            <Button
              size="md"
              radius="md"
              onClick={() => navigate(config.primaryHref)}
              style={{ backgroundColor: "#2563eb" }}
            >
              {config.primaryAction}
            </Button>
          ) : (
            <Button
              size="md"
              radius="md"
              variant="outline"
              onClick={() => navigate("/login")}
            >
              Go to Login
            </Button>
          )}
        </Group>
      </Stack>
    </PageWrapper>
  );
}

// ─── SHARED WRAPPER ───────────────────────────────────────────────────────────
function PageWrapper({ children }) {
  return (
    <Box
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f7fa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      {/* Branding */}
      <Box
        style={{
          position: "absolute",
          top: 28,
          left: 32,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Box
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        />
        <Text fw={700} size="lg" c="gray.8">
          ProjectFlow
        </Text>
      </Box>

      <Paper
        shadow="md"
        radius="xl"
        p="xl"
        style={{
          width: "100%",
          maxWidth: 480,
          padding: "2.5rem",
        }}
      >
        {children}
      </Paper>
    </Box>
  );
}
