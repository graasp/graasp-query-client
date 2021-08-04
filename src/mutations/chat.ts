import { QueryClient } from 'react-query';
import * as Api from '../api'
import { MUTATION_KEYS } from '../config/keys';
import { QueryClientConfig } from '../types';

const { POST_ITEM_CHAT_MESSAGE } = MUTATION_KEYS;

export default (queryClient: QueryClient, queryConfig: QueryClientConfig) => {
  queryClient.setMutationDefaults(POST_ITEM_CHAT_MESSAGE, {
      mutationFn: (chatMsg) => Api.postItemChatMessage(chatMsg, queryConfig),
  });
};