import { MAX_TARGETS_FOR_READ_REQUEST, UUID } from '@graasp/sdk';

import { useQuery } from '@tanstack/react-query';

import { splitRequestByIdsAndReturn } from '../api/axios.js';
import * as Api from '../api/itemTag.js';
import { UndefinedArgument } from '../config/errors.js';
import { itemKeys } from '../keys.js';
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
      enabled: Boolean(ids?.length),
      ...defaultQueryOptions,
    });
  };

  return { useItemTags, useItemsTags };
};
