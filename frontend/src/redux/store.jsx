import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import orgReducer from './slices/orgSlice';
import projReducer from './slices/projSlice';
import memberReducer from './slices/memberSlice';
import taskReducer from './slices/taskSlice';
import projectMemberReducer from './slices/projMemberSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    org: orgReducer,
    proj : projReducer,
    team : memberReducer,
    task : taskReducer,
    projectMember: projectMemberReducer,
  },
});
