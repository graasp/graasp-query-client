import { ItemTag, UUID, convertJs } from '@graasp/sdk';
import { ItemTagRecord, ResultOfRecord } from '@graasp/sdk/frontend';

import { List } from 'immutable';
import { useQuery, useQueryClient } from 'react-query';

import * as Api from '../api';
import { UndefinedArgument } from '../config/errors';
import { itemTagsKeys } from '../config/keys';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  const useItemTags = (id?: UUID) =>
    useQuery({
      queryKey: itemTagsKeys.singleId(id),
      queryFn: (): Promise<List<ItemTagRecord>> => {
        if (!id) {
          throw new UndefinedArgument();
        }
        return Api.getItemTags(id, queryConfig).then((data) => convertJs(data));
      },
      enabled: Boolean(id),
      ...defaultQueryOptions,
    });

  const useItemsTags = (ids?: UUID[]) => {
    const queryClient = useQueryClient();
    return useQuery({
      queryKey: itemTagsKeys.manyIds(ids),
      queryFn: (): Promise<ResultOfRecord<ItemTag[]>> => {
        if (!ids || ids?.length === 0) {
          throw new UndefinedArgument();
        }
        return Api.getItemsTags(ids, queryConfig).then((data) =>
          convertJs(data),
        );
      },
      onSuccess: async (tags) => {
        // save tags in their own key
        ids?.forEach(async (id) => {
          const itemTags = tags?.data?.get(id);
          if (itemTags?.size) {
            queryClient.setQueryData(
              itemTagsKeys.singleId(id),
              itemTags as List<ItemTagRecord>,
            );
          }
        });
      },
      enabled: Boolean(ids && ids.length),
      ...defaultQueryOptions,
    });
  };

  return { useItemTags, useItemsTags };
};
