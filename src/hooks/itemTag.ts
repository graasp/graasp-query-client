import { QueryClient, useQuery } from '@tanstack/react-query';
import { List } from 'immutable';

import { convertJs } from '@graasp/sdk';
import { isError } from '@graasp/utils';

import * as Api from '../api';
import { CONSTANT_KEY_CACHE_TIME_MILLISECONDS } from '../config/constants';
import { UndefinedArgument } from '../config/errors';
import {
  TAGS_KEY,
  buildItemTagsKey,
  buildManyItemTagsKey,
} from '../config/keys';
import { ItemTagRecord, QueryClientConfig, UUID } from '../types';

export default (queryConfig: QueryClientConfig, queryClient: QueryClient) => {
  const { defaultQueryOptions } = queryConfig;

  const useTags = () =>
    useQuery({
      queryKey: TAGS_KEY,
      queryFn: (): Promise<List<ItemTagRecord>> =>
        Api.getTags(queryConfig).then((data) => convertJs(data)),
      ...defaultQueryOptions,
      cacheTime: CONSTANT_KEY_CACHE_TIME_MILLISECONDS,
    });

  const useItemTags = (id?: UUID) =>
    useQuery({
      queryKey: buildItemTagsKey(id),
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
      queryKey: buildManyItemTagsKey(ids),
      queryFn: (): Promise<List<List<ItemTagRecord>>> => {
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
              buildItemTagsKey(id),
              itemTags as List<ItemTagRecord>,
            );
          }
        });
      },
      enabled: Boolean(ids && ids.length),
      ...defaultQueryOptions,
    });

  return { useTags, useItemTags, useItemsTags };
};
