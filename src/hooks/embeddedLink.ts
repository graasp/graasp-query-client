import { useQuery } from '@tanstack/react-query';

import * as Api from '../api/embeddedLink.js';
import { UndefinedArgument } from '../config/errors.js';
import { buildEmbeddedLinkMetadataKey } from '../config/keys.js';
import { QueryClientConfig } from '../types.js';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  return {
    useMetadata: (link: string) =>
      useQuery({
        queryKey: buildEmbeddedLinkMetadataKey(link),
        queryFn: () => {
          if (!link) {
            throw new UndefinedArgument();
          }
          return Api.getEmbeddedLinkMetadata(link, queryConfig);
        },
        enabled: Boolean(link),
        ...defaultQueryOptions,
      }),
  };
};
