import { useDispatch, useSelector } from "react-redux";
import { createTask, fetchTasks } from "../slices/taskSlice";
import { useCallback } from "react";

export const useTask = () => {
  const dispatch = useDispatch();
  const { tasks, loading, error } = useSelector((state) => state.task);

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

  return {
    createTask: createTaskAsync,
    loadTasks,
    tasks,
    loading,
    error,
  };
};
