import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { fetchProjects, clearProjects,createProject } from '../slices/projSlice'; 

export const useProj = () => {
    const dispatch = useDispatch();
    const { projects, loading, error, currentOrgId } = useSelector((state) => state.proj);    

    const loadProjects = useCallback((organizationId) => {
        return dispatch(fetchProjects(organizationId));
    }, [dispatch]);// created once and used forever, so no need to include projects/loading/error in deps

    const clearAllProjects = useCallback(() => {
        dispatch(clearProjects());
    }, [dispatch]);

    const createNewProject = useCallback((projectData) => {
        return dispatch(createProject(projectData));
    }, [dispatch]);

    return { projects, loading, error, currentOrgId, loadProjects, clearAllProjects, createNewProject };
}