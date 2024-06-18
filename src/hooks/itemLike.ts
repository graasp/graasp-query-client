import { UUID } from '@graasp/sdk';

import { useQuery } from '@tanstack/react-query';

import * as Api from '../api/itemLike.js';
import { UndefinedArgument } from '../config/errors.js';
import { itemKeys, memberKeys } from '../keys.js';
import { QueryClientConfig } from '../types.js';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  const useLikesForMember = (memberId?: UUID) =>
    useQuery({
      queryKey: memberKeys.single(memberId).likedItems,
      queryFn: () => {
        if (!memberId) {
          throw new UndefinedArgument();
        }
        return Api.getLikedItems(memberId, queryConfig);
      },
      ...defaultQueryOptions,
      enabled: Boolean(memberId),
    });

  const useLikesForItem = (itemId?: UUID) =>
    useQuery({
      queryKey: itemKeys.single(itemId).likes,
      queryFn: () => {
        if (!itemId) {
          throw new UndefinedArgument();
        }
        return Api.getItemLikes(itemId, queryConfig);
      },
      ...defaultQueryOptions,
      enabled: Boolean(itemId),
    });

  return { useLikesForMember, useLikesForItem };
};
