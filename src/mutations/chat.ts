import { QueryClient } from 'react-query';
import * as Api from '../api';
import { buildItemChatKey, MUTATION_KEYS } from '../config/keys';
import { postItemChatMessageRoutine } from '../routines';
import { QueryClientConfig } from '../types';

const { POST_ITEM_CHAT_MESSAGE } = MUTATION_KEYS;

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  queryClient.setMutationDefaults(POST_ITEM_CHAT_MESSAGE, {
    mutationFn: (chatMsg) => Api.postItemChatMessage(chatMsg, queryConfig),
    onError: (error) => {
      queryConfig.notifier?.({
        type: postItemChatMessageRoutine.FAILURE,
        payload: { error },
      });
    },
    onSettled: (_data, _error, { chatId }) => {
      // invalidate keys only if websockets are disabled
      // otherwise the cache is updated automatically
      if (!queryConfig.enableWebsocket) {
        queryClient.invalidateQueries(buildItemChatKey(chatId));
      }
    },
  });
};
