import { useDispatch, useSelector } from "react-redux";
import { createTask } from "../slices/taskSlice";

export const useTask = () => {
  const dispatch = useDispatch();
  const { tasks, loading, error } = useSelector((state) => state.task);

  const createTaskAsync = useCallback(
    (projectId, taskData) => {
      return dispatch(createTask({ projectId, taskData }));
    },
    [dispatch],
  );

  return {
    createTask: createTaskAsync,
    tasks,
    loading,
    error,
  };
};
