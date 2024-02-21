import createRoutine from './utils.js';

export const postItemChatMessageRoutine = createRoutine(
  'POST_CHAT_MESSAGES_MESSAGE',
);

export const patchItemChatMessageRoutine = createRoutine(
  'PATCH_CHAT_MESSAGES_MESSAGE',
);

export const deleteItemChatMessageRoutine = createRoutine(
  'DELETE_CHAT_MESSAGES_MESSAGE',
);

export const clearItemChatRoutine = createRoutine('CLEAR_CHAT_MESSAGES');
