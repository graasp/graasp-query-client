import { UUID, convertJs } from '@graasp/sdk';
import { ItemLikeRecord } from '@graasp/sdk/frontend';

import { List } from 'immutable';
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
      queryFn: (): Promise<List<ItemLikeRecord>> => {
        if (!memberId) {
          throw new UndefinedArgument();
        }
        return Api.getLikedItems(memberId, queryConfig).then((data) =>
          convertJs(data),
        );
      },
      ...defaultQueryOptions,
      enabled: Boolean(memberId),
    });

  const useLikesForItem = (itemId?: UUID) =>
    useQuery({
      queryKey: buildGetLikesForItem(itemId),
      queryFn: (): Promise<List<ItemLikeRecord>> => {
        if (!itemId) {
          throw new UndefinedArgument();
        }
        return Api.getItemLikes(itemId, queryConfig).then((data) =>
          convertJs(data),
        );
      },
      ...defaultQueryOptions,
      enabled: Boolean(itemId),
    });

  return { useLikesForMember, useLikesForItem };
};
