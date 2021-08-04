import { Map } from 'immutable';
import { useQuery } from 'react-query';
import * as Api from '../api';
import { buildItemChatKey } from '../config/keys';
import { QueryClientConfig, UUID } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { retry, cacheTime, staleTime } = queryConfig;
  const defaultOptions = {
    retry,
    cacheTime,
    staleTime,
  };

  return {
    useItemChat: (itemId: UUID) =>
      useQuery({
        queryKey: buildItemChatKey(itemId),
        queryFn: () =>
          Api.getItemChat(itemId, queryConfig).then((data) => Map(data)),
        ...defaultOptions,
        enabled: Boolean(itemId),
      }),
  };
};