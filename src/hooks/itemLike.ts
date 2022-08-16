import { useQuery } from 'react-query';
import { QueryClientConfig, UUID } from '../types';
import * as Api from '../api';
import { buildGetLikeCountKey, buildGetLikedItemsKey } from '../config/keys';
import { convertJs } from '../utils/util';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  const useLikedItems = (memberId: UUID) =>
    useQuery({
      queryKey: buildGetLikedItemsKey(memberId),
      queryFn: () =>
        Api.getLikedItems(memberId, queryConfig).then((data) =>
          convertJs(data),
        ),
      ...defaultQueryOptions,
      enabled: Boolean(memberId),
    });

  const useLikeCount = (itemId: UUID) =>
    useQuery({
      queryKey: buildGetLikeCountKey(itemId),
      queryFn: () => Api.getLikeCount(itemId, queryConfig).then((data) => data),
      ...defaultQueryOptions,
      enabled: Boolean(itemId),
    });

  return { useLikeCount, useLikedItems };
};
