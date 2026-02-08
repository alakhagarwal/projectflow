import { useDispatch, useSelector } from 'react-redux';
import { fetchOrganizations,createOrganization } from '../slices/orgSlice';

export const useOrg = () => {
    const dispatch = useDispatch();
    const { organizations, loading, error } = useSelector((state) => state.org);

    const loadOrganizations = () => {
        dispatch(fetchOrganizations());
    };

    const addOrganization = (name, slug, logo) => {
        return dispatch(createOrganization({ name, slug, logo }));
    }

    return { organizations, loading, error, loadOrganizations, addOrganization };
};