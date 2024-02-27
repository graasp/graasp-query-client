import { MAX_TARGETS_FOR_READ_REQUEST, UUID } from '@graasp/sdk';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { splitRequestByIdsAndReturn } from '../api/axios.js';
import * as Api from '../api/itemTag.js';
import { UndefinedArgument } from '../config/errors.js';
import { itemKeys } from '../config/keys.js';
import { QueryClientConfig } from '../types.js';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  const useItemTags = (id?: UUID) =>
    useQuery({
      queryKey: itemKeys.single(id).tags,
      queryFn: () => {
        if (!id) {
          throw new UndefinedArgument();
        }
        return Api.getItemTags(id, queryConfig);
      },
      enabled: Boolean(id),
      ...defaultQueryOptions,
    });

  const useItemsTags = (ids?: UUID[]) => {
    const queryClient = useQueryClient();
    return useQuery({
      queryKey: itemKeys.many(ids).tags,
      queryFn: () => {
        if (!ids || ids?.length === 0) {
          throw new UndefinedArgument();
        }
        return splitRequestByIdsAndReturn(
          ids,
          MAX_TARGETS_FOR_READ_REQUEST,
          (chunk) => Api.getItemsTags(chunk, queryConfig),
          true,
        );
      },
      onSuccess: async (tags) => {
        // save tags in their own key
        ids?.forEach(async (id) => {
          const itemTags = tags?.data?.[id];
          if (itemTags?.length) {
            queryClient.setQueryData(itemKeys.single(id).tags, itemTags);
          }
        });
      },
      enabled: Boolean(ids && ids.length),
      ...defaultQueryOptions,
    });
  };

  return { useItemTags, useItemsTags };
};
