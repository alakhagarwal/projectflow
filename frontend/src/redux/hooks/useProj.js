import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects,setLoading } from '../slices/projSlice'; 

export const useProj = () => {
    const dispatch = useDispatch();
    const { projects, loading, error } = useSelector((state) => state.proj);    

    const loadProjects = (organizationId) => {
        dispatch(fetchProjects(organizationId));
    }

    const setProjectsLoading = (isLoading) => {
        dispatch(setLoading(isLoading));
    }

    return { projects, loading, error, loadProjects, setProjectsLoading };
}