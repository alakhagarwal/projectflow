import { use, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../redux/hooks/useAuth";
import { Box, Loader, Center } from "@mantine/core";

export default function ProtectedRoute({ children }) {
  const { 
    isAuthenticated, 
    isValidating, 
    validationChecked, 
    validateToken 
  } = useAuth();

  useEffect(() => {
    // Only validate if we haven't checked yet
    if (!validationChecked) {
      validateToken();
    }


  }, [validationChecked, validateToken]);

  if (isValidating) {
    return (
      <Center style={{ height: "100vh" }}>
        <Loader />
      </Center>
    );
  }

  if (!isAuthenticated && validationChecked) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}