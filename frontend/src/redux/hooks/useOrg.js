import { useDispatch, useSelector } from 'react-redux';
import { fetchOrganizations,createOrganization,clearOrganizations,setSelectedOrganization } from '../slices/orgSlice';

export const useOrg = () => {
    const dispatch = useDispatch();
    const { organizations, loading, error, selectedOrganization } = useSelector((state) => state.org);

    const loadOrganizations = () => {
        dispatch(fetchOrganizations());
    };

    const addOrganization = (name, slug, logo) => {
        return dispatch(createOrganization({ name, slug, logo }));
    }

    const setSelectedOrg = (org) => {
        dispatch(setSelectedOrganization(org));
    }

    const clearAllOrganizations = () => {
        dispatch(clearOrganizations());
    };

    return { organizations, loading, error, selectedOrganization, loadOrganizations, addOrganization, setSelectedOrg, clearAllOrganizations };
};