import { useDispatch, useSelector } from "react-redux";
import { clearTaskState, createTask, fetchTasks, fetchAssignedTasks } from "../slices/taskSlice";
import { useCallback } from "react";

export const useTask = () => {
  const dispatch = useDispatch();
  const { 
    tasks, 
    loading, 
    addLoading, 
    error, 
    addError, 
    addedTask,
    assignedTasks,
    assignedTasksLoading,
    assignedTasksError 
  } = useSelector((state) => state.task);

  const createTaskAsync = useCallback(
    (projectId, taskData) => {
      return dispatch(createTask({ projectId, taskData }));
    },
    [dispatch],
  );

  const loadTasks = useCallback(
    (projectId) => {
      return dispatch(fetchTasks(projectId));
    },
    [dispatch],
  );

  const loadAssignedTasks = useCallback(
    (organizationId) => {
      return dispatch(fetchAssignedTasks(organizationId));
    },
    [dispatch],
  );

  const clearTasks = useCallback(() => {
    dispatch(clearTaskState());
  }, [dispatch]);

  return {
    createTask: createTaskAsync,
    loadTasks,
    loadAssignedTasks,
    clearTasks,
    tasks,
    loading,
    addLoading,
    error,
    addError,
    addedTask,
    assignedTasks,
    assignedTasksLoading,
    assignedTasksError,
  };
};
