import { useQuery } from 'react-query';
import { List } from 'immutable';
import { QueryClientConfig, UndefinedArgument, UUID } from '../types';
import * as Api from '../api';
import { buildItemTagsKey, TAGS } from '../config/keys';

export default (queryConfig: QueryClientConfig) => {
  const { retry, cacheTime, staleTime } = queryConfig;
  const defaultOptions = {
    retry,
    cacheTime,
    staleTime,
  };

  const useTags = () =>
    useQuery({
      queryKey: TAGS,
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

  return { useTags, useItemTags };
};
