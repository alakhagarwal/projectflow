import {useDispatch, useSelector} from 'react-redux';
import {fetchMembers,inviteMember,acceptInvite} from '../slices/memberSlice';
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

    

    const acceptInviteMember = useCallback((orgId, token) => {
        return dispatch(acceptInvite({ orgId, token }));
    }, [dispatch]);

    return {
        members,
        inviteError,
        loading,
        error,
        loadMembers,
        inviteNewMember,
        acceptInviteMember
    };
};

export default useMember;