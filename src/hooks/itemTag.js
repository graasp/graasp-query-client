import { useQuery } from 'react-query';
import { buildItemTagsQuery, buildTagsQuery } from './utils';

export default (queryClient, queryConfig) => {
  const useTags = () => useQuery(buildTagsQuery(queryConfig));

  const useItemTags = (id) =>
    useQuery({
      ...buildItemTagsQuery(id, queryConfig),
      enabled: Boolean(id),
    });

  return { useTags, useItemTags };
};
