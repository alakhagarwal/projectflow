import { useDispatch, useSelector } from 'react-redux';
import { fetchOrganizations } from '../slices/orgSlice';

export const useOrg = () => {
    const dispatch = useDispatch();
    const { organizations, loading, error } = useSelector((state) => state.org);

    const loadOrganizations = () => {
        dispatch(fetchOrganizations());
    };

    return { organizations, loading, error, loadOrganizations };
};