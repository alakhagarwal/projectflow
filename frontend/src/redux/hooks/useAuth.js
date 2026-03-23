import { useSelector, useDispatch } from "react-redux";
import {
  loginUser,
  registerUser,
  validateToken,
  logout,
  clearError,
  clearRegisterError,
  resetRegisterState,
  updateProfile,
  resetUpdateProfileState,
} from "../slices/authSlice";
import { clearOrganizations } from "../slices/orgSlice";

export const useAuth = () => {
  const dispatch = useDispatch();

  const {
    token,
    email,
    isAuthenticated,
    loading,
    error,
    registerLoading,
    registerError,
    registerSuccess,
    fullName,
    isValidating, // ADD
    validationChecked, // ADD
    updateProfileLoading,
    updateProfileError,
    updateProfileSuccess,
  } = useSelector((state) => state.auth);

  return {
    // State
    token,
    email,
    isAuthenticated,
    loading,
    error,
    fullName,
    registerLoading,
    registerError,
    registerSuccess,
    isValidating, // ADD - shows if token is being validated
    validationChecked, // ADD - shows if validation completed
    updateProfileLoading,
    updateProfileError,
    updateProfileSuccess,

    // Actions
    login: (credentials) => dispatch(loginUser(credentials)),
    register: (userData) => dispatch(registerUser(userData)),
    validateToken: () => dispatch(validateToken()), // ADD THIS
    logout: () => {
      dispatch(logout());
      dispatch(clearOrganizations()); // Clear orgs on logout
    },
    clearError: () => dispatch(clearError()),
    clearRegisterError: () => dispatch(clearRegisterError()),
    resetRegisterState: () => dispatch(resetRegisterState()),
    updateProfile: (userData) => dispatch(updateProfile(userData)),
    resetUpdateProfileState: () => dispatch(resetUpdateProfileState()),
  };
};
