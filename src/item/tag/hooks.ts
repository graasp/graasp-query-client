import { DiscriminatedItem } from '@graasp/sdk';

import { useQuery } from '@tanstack/react-query';

import { UndefinedArgument } from '../../config/errors.js';
import { itemKeys } from '../../keys.js';
import { QueryClientConfig } from '../../types.js';
import { getTagsByItem } from './api.js';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  return {
    useTagsByItem: ({ itemId }: { itemId?: DiscriminatedItem['id'] }) => {
      return useQuery({
        queryKey: itemKeys.single(itemId).tags,
        queryFn: () => {
          if (!itemId) {
            throw new UndefinedArgument({ itemId });
          }
          return getTagsByItem({ itemId }, queryConfig);
        },
        enabled: Boolean(itemId),
        ...defaultQueryOptions,
      });
    },
  };
};
