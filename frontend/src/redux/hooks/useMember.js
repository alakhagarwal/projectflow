import {useDispatch, useSelector} from 'react-redux';
import {fetchMembers} from '../slices/memberSlice';
import { useCallback } from 'react';

export const useMember = () => {
    const dispatch = useDispatch();
    const members = useSelector((state) => state.team.members);
    const loading = useSelector((state) => state.team.loading);
    const error = useSelector((state) => state.team.error);

    const loadMembers = useCallback((orgId) => {
        return dispatch(fetchMembers(orgId));
    }, [dispatch]);

    return { members, loading, error, loadMembers };
};

export default useMember;