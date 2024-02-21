import createRoutine from './utils.js';

export const getInvitationRoutine = createRoutine('GET_INVITATION');
export const postInvitationsRoutine = createRoutine('POST_INVITATIONS');
export const patchInvitationRoutine = createRoutine('PATCH_INVITATION');
export const deleteInvitationRoutine = createRoutine('DELETE_INVITATION');
export const resendInvitationRoutine = createRoutine('RESEND_INVITATION');
