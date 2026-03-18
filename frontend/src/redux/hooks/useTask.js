import { useDispatch, useSelector } from "react-redux";
import { clearTaskState, createTask, fetchTasks } from "../slices/taskSlice";
import { useCallback } from "react";

export const useTask = () => {
  const dispatch = useDispatch();
  const { tasks, loading, addLoading, error, addError, addedTask } = useSelector((state) => state.task);

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

  const clearTasks = useCallback(() => {
    dispatch(clearTaskState());
  }, [dispatch]);

  return {
    createTask: createTaskAsync,
    loadTasks,
    clearTasks,
    tasks,
    loading,
    addLoading,
    error,
    addError,
    addedTask,
  };
};
