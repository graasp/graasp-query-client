import { QueryClient, useQuery } from 'react-query';
import { List } from 'immutable';
import { ItemTag, QueryClientConfig, UndefinedArgument, UUID } from '../types';
import * as Api from '../api';
import {
  buildItemTagsKey,
  buildManyItemTagsKey,
  TAGS_KEY,
} from '../config/keys';
import { isError } from '../utils/item';

export default (queryConfig: QueryClientConfig, queryClient: QueryClient) => {
  const { retry, cacheTime, staleTime } = queryConfig;
  const defaultOptions = {
    retry,
    cacheTime,
    staleTime,
  };

  const useTags = () =>
    useQuery({
      queryKey: TAGS_KEY,
      queryFn: () => Api.getTags(queryConfig).then((data) => List(data)),
      ...defaultOptions,
    });

  const useItemTags = (id?: UUID) =>
    useQuery({
      queryKey: buildItemTagsKey(id),
      queryFn: () => {
        if (!id) {
          throw new UndefinedArgument();
        }
        return Api.getItemTags(id, queryConfig).then((data) => List(data));
      },
      enabled: Boolean(id),
      ...defaultOptions,
    });

  const useItemsTags = (ids: UUID[]) =>
    useQuery({
      queryKey: buildManyItemTagsKey(ids),
      queryFn: () => {
        if (!ids) {
          throw new UndefinedArgument();
        }
        return Api.getItemsTags(ids, queryConfig).then((data) => List(data));
      },
      onSuccess: async (tags) => {
        // save tags in their own key
        ids?.forEach(async (id, idx) => {
          const itemTags = tags.get(idx);
          if (!isError(itemTags)) {
            queryClient.setQueryData(
              buildItemTagsKey(id),
              List(itemTags as ItemTag[]),
            );
          }
        });
      },
      enabled: Boolean(ids && ids.length),
      ...defaultOptions,
    });

  return { useTags, useItemTags, useItemsTags };
};
