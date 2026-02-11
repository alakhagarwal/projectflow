import { useState } from "react";
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Text,
  Box,
  Anchor,
  BackgroundImage,
  Flex,
} from "@mantine/core";
import { useEffect } from "react";
import loginBg from "../assets/Login.png";
import { NavLink } from "react-router-dom";
import { useAuth } from "../redux/hooks/useAuth.js";
import { useNavigate } from "react-router-dom";

const UserIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

// Lock Icon for Password input
const LockIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const {
    login,
    loading,
    error,
    isAuthenticated,
    validationChecked,
    validateToken,
    clearError,
  } = useAuth();
  const navigate = useNavigate();

useEffect(() => {
  if (!validationChecked) {
    validateToken();
  }
  if (isAuthenticated && validationChecked) {
    navigate("/", { replace: true });
  }
}, [isAuthenticated, validationChecked, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    try {
      await login({ email, password }).unwrap();
      // ☝️ .unwrap() CONVERTS rejected action into thrown error
      navigate("/"); // Need to add useNavigate
    } catch (err) {
      // Error already in Redux state, will show automatically
      console.log("Login failed:", err);
    }
  };

  return (
    <BackgroundImage
      src={loginBg}
      display={"flex"}
      justify="center"
      align="center"
      className="min-h-screen bg-cover bg-center"
    >
      <Box className="relative z-10 w-full flex items-center justify-center">
        {/* Login Card */}
        <Paper
          shadow="lg"
          radius="lg"
          p="xl"
          className="relative z-10 w-full max-w-md mx-4"
          style={{
            backgroundColor: "rgba(30, 58, 138, 0.85)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <Box className="text-center mb-8">
              <Text
                size="xl"
                fw={700}
                c={"#ffffff"}
                style={{ fontSize: "1.75rem" }}
                mb={10}
              >
                Login
              </Text>
              <Text size="sm" className="text-blue-200" mb={15} c={"#ffffff"}>
                Please enter your Email and your Password
              </Text>
            </Box>

            {/* Form Fields */}
            <Box className="space-y-4 flex flex-col gap-5.5">
              {/* Email Input */}
              <TextInput
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftSection={<UserIcon />}
                size="lg"
                radius={12}
                styles={{
                  input: {
                    backgroundColor: "rgba(37, 99, 235, 0.5)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "white",
                    "&::placeholder": {
                      color: "rgba(255, 255, 255, 0.6)",
                    },
                  },
                  section: {
                    color: "rgba(255, 255, 255, 0.7)",
                  },
                }}
                classNames={{
                  input: "placeholder:text-blue-200",
                }}
              />

              {/* Password Input */}
              <Box>
                <PasswordInput
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftSection={<LockIcon />}
                  size="lg"
                  radius={12}
                  styles={{
                    input: {
                      backgroundColor: "rgba(37, 99, 235, 0.5)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      color: "white",
                    },
                    innerInput: {
                      color: "white",
                    },
                    section: {
                      color: "rgba(255, 255, 255, 0.7)",
                    },
                    visibilityToggle: {
                      color: "rgba(255, 255, 255, 0.7)",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                      },
                    },
                  }}
                  classNames={{
                    input: "placeholder:text-blue-200",
                  }}
                />
              </Box>
            </Box>

            {/* Login Button */}
            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={loading}
              mt="xl"
              variant="outline"
              mb={"md"}
              radius={12}
              styles={{
                root: {
                  borderColor: "#22c55e",
                  color: "#22c55e",
                  "&:hover": {
                    backgroundColor: "rgba(34, 197, 94, 0.1)",
                    borderColor: "#16a34a",
                  },
                },
              }}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
            {error && (
              <Text c="red" size="sm" align="center">
                {error}
              </Text>
            )}

            {/* Register Link */}
            <Box className="text-center mt-6">
              <Text size="sm" c={"#ffffff"}>
                Not a member yet?{" "}
                <NavLink
                  to="/register"
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  Register
                </NavLink>
              </Text>
            </Box>
          </form>
        </Paper>
      </Box>
    </BackgroundImage>
  );
}
