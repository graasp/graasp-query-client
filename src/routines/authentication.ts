import createRoutine from './utils.js';

export const signOutRoutine = createRoutine('SIGN_OUT');
export const signInRoutine = createRoutine('SIGN_IN');
export const signInWithPasswordRoutine = createRoutine('SIGN_IN_WITH_PASSWORD');
export const signUpRoutine = createRoutine('SIGN_UP');
export const switchMemberRoutine = createRoutine('SWITCH_MEMBER');
export const createPasswordResetRequestRoutine = createRoutine(
  'CREATE_PASSWORD_RESET_REQUEST',
);
export const resolvePasswordResetRequestRoutine = createRoutine(
  'RESOLVE_PASSWORD_RESET_REQUEST',
);
