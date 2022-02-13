import { useQuery } from 'react-query';
import { List } from 'immutable';
import { QueryClientConfig, UUID } from '../types';
import * as Api from '../api';
import { buildGetLikeCountKey, buildGetLikedItemsKey } from '../config/keys';

export default (queryConfig: QueryClientConfig) => {
  const { retry, cacheTime, staleTime } = queryConfig;
  const defaultOptions = {
    retry,
    cacheTime,
    staleTime,
  };

  const useLikedItems = (memberId: UUID) =>
    useQuery({
      queryKey: buildGetLikedItemsKey(memberId),
      queryFn: () =>
        Api.getLikedItems(memberId, queryConfig).then((data) => List(data)),
      ...defaultOptions,
      enabled: Boolean(memberId),
    });

  const useLikeCount = (itemId: UUID) =>
    useQuery({
      queryKey: buildGetLikeCountKey(itemId),
      queryFn: () => Api.getLikeCount(itemId, queryConfig).then((data) => data),
      ...defaultOptions,
      enabled: Boolean(itemId),
    });

  return { useLikeCount, useLikedItems };
};
