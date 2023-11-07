import { UUID } from '@graasp/sdk';

import { useQuery } from 'react-query';

import * as Api from '../api';
import { UndefinedArgument } from '../config/errors';
import {
  buildGetLikesForItem,
  buildGetLikesForMemberKey,
} from '../config/keys';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  const useLikesForMember = (memberId?: UUID) =>
    useQuery({
      queryKey: buildGetLikesForMemberKey(memberId),
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
      queryKey: buildGetLikesForItem(itemId),
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
