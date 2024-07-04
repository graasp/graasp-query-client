import createRoutine from '../../routines/utils.js';

export const changePlanRoutine = createRoutine('SUBSCRIPTION_CHANGE_PLAN');
export const createSetupIntentRoutine = createRoutine(
  'SUBSCRIPTION_CREATE_SETUP_INTENT',
);
export const setDefaultCardRoutine = createRoutine(
  'SUBSCRIPTION_SET_DEFAULT_CARD',
);
