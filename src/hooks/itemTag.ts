import { MAX_TARGETS_FOR_READ_REQUEST, UUID } from '@graasp/sdk';

import { useQuery, useQueryClient } from 'react-query';

import * as Api from '../api';
import { splitRequestByIdsAndReturn } from '../api/axios';
import { UndefinedArgument } from '../config/errors';
import { itemTagsKeys } from '../config/keys';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  const useItemTags = (id?: UUID) =>
    useQuery({
      queryKey: itemTagsKeys.singleId(id),
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
      queryKey: itemTagsKeys.manyIds(ids),
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
            queryClient.setQueryData(itemTagsKeys.singleId(id), itemTags);
          }
        });
      },
      enabled: Boolean(ids && ids.length),
      ...defaultQueryOptions,
    });
  };

  return { useItemTags, useItemsTags };
};
