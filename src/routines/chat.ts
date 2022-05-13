import createRoutine from './utils';

export const postItemChatMessageRoutine = createRoutine(
  'POST_ITEM_CHAT_MESSAGE',
);

export const patchItemChatMessageRoutine = createRoutine(
  'PATCH_ITEM_CHAT_MESSAGE',
);

export const deleteItemChatMessageRoutine = createRoutine(
  'DELETE_ITEM_CHAT_MESSAGE',
);

export const clearItemChatRoutine = createRoutine('CLEAR_ITEM_CHAT');
