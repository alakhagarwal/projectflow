import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	addProjectMember,
	clearAddedProjectMember,
	clearProjectMembersState,
    fetchProjectMembers,
} from "../slices/projMemberSlice";

export const useProjMember = () => {
	const dispatch = useDispatch();
	const members = useSelector((state) => state.projectMember?.members || []);
	const addedMember = useSelector((state) => state.projectMember?.addedMember || null);
	const loading = useSelector((state) => state.projectMember?.loading || false);
	const error = useSelector((state) => state.projectMember?.error || null);
	const addError = useSelector((state) => state.projectMember?.addError || null);

	const addMemberToProject = useCallback(
		(projectId, email, projectRole) => {
			return dispatch(addProjectMember({ projectId, email, projectRole }));
		},
		[dispatch],
	);

    const loadProjectMembers = useCallback(
        (projectId) => {
            return dispatch(fetchProjectMembers(projectId));
        },
        [dispatch],
    );

	const clearProjectMembers = useCallback(() => {
		dispatch(clearProjectMembersState());
	}, [dispatch]);

	const clearLastAddedProjectMember = useCallback(() => {
		dispatch(clearAddedProjectMember());
	}, [dispatch]);

	return {
		members,
		addedMember,
		loading,
		error,
		addError,
		addMemberToProject,
		loadProjectMembers,
		clearProjectMembers,
		clearLastAddedProjectMember,
	};
};

export default useProjMember;
