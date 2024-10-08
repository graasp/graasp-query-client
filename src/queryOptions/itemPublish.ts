import { UUID } from '@graasp/sdk';

import { queryOptions } from '@tanstack/react-query';

import { UndefinedArgument } from '../config/errors.js';
import { Api, QueryClientConfig } from '../index.js';
import { itemKeys } from '../keys.js';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  return {
    publishedItemsForMemberOptions: (
      memberId?: UUID,
      options?: { enabled?: boolean },
    ) =>
      queryOptions({
        queryKey: itemKeys.published().byMember(memberId),
        queryFn: () => {
          if (!memberId) {
            throw new UndefinedArgument();
          }
          return Api.getPublishedItemsForMember(memberId, queryConfig);
        },
        ...defaultQueryOptions,
        enabled: Boolean(memberId) && (options?.enabled ?? true),
      }),

    mostLikedPublishedItemsOptions: (
      args?: {
        limit?: number;
      },
      options?: { enabled?: boolean },
    ) => {
      const enabledValue = options?.enabled ?? true;
      return queryOptions({
        queryKey: itemKeys.published().mostLiked(args?.limit),
        queryFn: () => Api.getMostLikedPublishedItems(args ?? {}, queryConfig),
        ...defaultQueryOptions,
        enabled: enabledValue,
      });
    },

    mostRecentPublishedItemsOptions: (
      args?: {
        limit?: number;
      },
      options?: { enabled?: boolean },
    ) => {
      const enabledValue = options?.enabled ?? true;
      return queryOptions({
        queryKey: itemKeys.published().mostRecent(args?.limit),
        queryFn: () => Api.getMostRecentPublishedItems(args ?? {}, queryConfig),
        ...defaultQueryOptions,
        enabled: enabledValue,
      });
    },
  };
};
