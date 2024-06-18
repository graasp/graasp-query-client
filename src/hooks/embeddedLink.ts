import { useQuery } from '@tanstack/react-query';

import * as Api from '../api/embeddedLink.js';
import { UndefinedArgument } from '../config/errors.js';
import { buildEmbeddedLinkMetadataKey } from '../keys.js';
import { QueryClientConfig } from '../types.js';
import useDebounce from './useDebounce.js';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions } = queryConfig;

  return {
    useLinkMetadata: (link: string, debounceDelayMs = 500) => {
      const debouncedLink = useDebounce(link, debounceDelayMs);
      return useQuery({
        queryKey: buildEmbeddedLinkMetadataKey(debouncedLink),
        queryFn: () => {
          if (!debouncedLink) {
            throw new UndefinedArgument();
          }
          return Api.getEmbeddedLinkMetadata(debouncedLink, queryConfig);
        },
        enabled: Boolean(debouncedLink),
        ...defaultQueryOptions,
      });
    },
  };
};
