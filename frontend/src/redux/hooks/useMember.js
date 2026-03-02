import {useDispatch, useSelector} from 'react-redux';
import {fetchMembers,inviteMember} from '../slices/memberSlice';
import { useCallback } from 'react';

export const useMember = () => {
    const dispatch = useDispatch();
    const members = useSelector((state) => state.team.members);
    const inviteError = useSelector((state) => state.team.inviteError);
    const loading = useSelector((state) => state.team.loading);
    const error = useSelector((state) => state.team.error);

    const loadMembers = useCallback((orgId) => {
        return dispatch(fetchMembers(orgId));
    }, [dispatch]);

    const inviteNewMember = useCallback((orgId, email, role) => {
        return dispatch(inviteMember({ orgId, email, role }));
    }, [dispatch]);

    return { members, loading, error, inviteError, loadMembers, inviteNewMember };
};

export default useMember;