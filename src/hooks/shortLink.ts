import { useQuery } from 'react-query';

import * as Api from '../api/shortLink.js';
import { UndefinedArgument } from '../config/errors.js';
import { buildShortLinkKey, itemKeys } from '../config/keys.js';
import { QueryClientConfig } from '../types.js';

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
        queryKey: itemKeys.single(itemId).shortLinks,
        queryFn: () => Api.getShortLinksItem(itemId, queryConfig),
        enabled: true,
        ...defaultQueryOptions,
      }),
  };
};
