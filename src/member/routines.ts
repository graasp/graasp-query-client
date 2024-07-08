import createRoutine from '../routines/utils.js';

export const getMembersRoutine = createRoutine('GET_MEMBERS');
export const editMemberRoutine = createRoutine('EDIT_MEMBER');
export const deleteMemberRoutine = createRoutine('DELETE_MEMBER');
export const deleteCurrentMemberRoutine = createRoutine(
  'DELETE_CURRENT_MEMBER',
);
export const uploadAvatarRoutine = createRoutine('UPLOAD_AVATAR');
export const updatePasswordRoutine = createRoutine('UPDATE_PASSWORD');
export const updateEmailRoutine = createRoutine('UPDATE_EMAIL');
