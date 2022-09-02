import createRoutine from './utils';

export const getMembersRoutine = createRoutine('GET_MEMBERS');

export const editMemberRoutine = createRoutine('EDIT_MEMBER');
export const deleteMemberRoutine = createRoutine('DELETE_MEMBER');
export const uploadAvatarRoutine = createRoutine('UPLOAD_AVATAR');
export const addFavoriteItemRoutine = createRoutine('ADD_FAVORITE_ITEM');
export const deleteFavoriteItemRoutine = createRoutine('DELETE_FAVORITE_ITEM');
export const shareItemRoutine = createRoutine('SHARE_ITEM');
