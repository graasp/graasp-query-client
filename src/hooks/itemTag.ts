import { useQuery } from 'react-query';
import { List } from 'immutable';
import { QueryClientConfig, UUID } from '../types';
import * as Api from '../api';
import { buildItemTagsKey, ITEM_TAGS } from '../config/keys';

export default (queryConfig: QueryClientConfig) => {
  const { retry } = queryConfig;

  const useTags = () =>
    useQuery({
      queryKey: ITEM_TAGS,
      queryFn: () => Api.getTags(queryConfig).then((data) => List(data)),
      retry,
    });

  const useItemTags = (id: UUID) =>
    useQuery({
      queryKey: buildItemTagsKey(id),
      queryFn: () =>
        Api.getItemTags(id, queryConfig).then((data) => List(data)),
      enabled: Boolean(id),
      retry,
    });

  return { useTags, useItemTags };
};
