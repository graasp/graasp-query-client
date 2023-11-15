import { useQuery } from 'react-query';

import * as Api from '../api';
import { UndefinedArgument } from '../config/errors';
import { buildShortLinkKey, buildShortLinksItemKey } from '../config/keys';
import { QueryClientConfig } from '../types';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  return {
    useShortLinkAvailable: (alias: string | undefined) =>
      useQuery({
        queryKey: buildShortLinkKey(alias),
        queryFn: () => {
          if (!alias) {
            throw new UndefinedArgument();
          }
          return Api.getShortLinkAvailable(alias, queryConfig);
        },
        enabled: Boolean(alias),
        ...defaultQueryOptions,
      }),

    useShortLinksItem: (itemId: string) =>
      useQuery({
        queryKey: buildShortLinksItemKey(itemId),
        queryFn: () => Api.getShortLinksItem(itemId, queryConfig),
        enabled: true,
        ...defaultQueryOptions,
      }),
  };
};
