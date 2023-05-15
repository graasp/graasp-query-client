import { List } from 'immutable';
import { QueryClient, useQuery } from 'react-query';

import { ItemTag, UUID, convertJs, isError } from '@graasp/sdk';
import { ItemTagRecord, ResultOfRecord } from '@graasp/sdk/frontend';

import * as Api from '../api';
import { UndefinedArgument } from '../config/errors';
import { itemTagsKeys } from '../config/keys';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig, queryClient: QueryClient) => {
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

  const useItemsTags = (ids: UUID[]) =>
    useQuery({
      queryKey: itemTagsKeys.manyIds(ids),
      queryFn: (): Promise<ResultOfRecord<ItemTag[]>> => {
        if (!ids) {
          throw new UndefinedArgument();
        }
        return Api.getItemsTags(ids, queryConfig).then((data) =>
          convertJs(data),
        );
      },
      onSuccess: async (tags: List<List<ItemTagRecord>>) => {
        // save tags in their own key
        ids?.forEach(async (id, idx) => {
          const itemTags = tags.get(idx);
          if (!isError(itemTags)) {
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

  return { useItemTags, useItemsTags };
};
