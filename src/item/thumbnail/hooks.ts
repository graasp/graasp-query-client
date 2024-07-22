import { DiscriminatedItem, PackedItem, UUID } from '@graasp/sdk';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import {
  CONSTANT_KEY_STALE_TIME_MILLISECONDS,
  DEFAULT_THUMBNAIL_SIZE,
} from '../../config/constants.js';
import { UndefinedArgument } from '../../config/errors.js';
import { itemKeys } from '../../keys.js';
import { QueryClientConfig } from '../../types.js';
import { downloadItemThumbnail, downloadItemThumbnailUrl } from './api.js';

/**
 * @deprecated use useItemThumbnailUrl
 */
export const useItemThumbnail =
  (queryConfig: QueryClientConfig) =>
  ({ id, size = DEFAULT_THUMBNAIL_SIZE }: { id?: UUID; size?: string }) => {
    const { defaultQueryOptions } = queryConfig;
    const queryClient = useQueryClient();
    let shouldFetch = true;
    if (id) {
      shouldFetch =
        queryClient.getQueryData<PackedItem>(itemKeys.single(id).content)
          ?.settings?.hasThumbnail ?? true;
    }
    return useQuery({
      queryKey: itemKeys.single(id).thumbnail({ size, replyUrl: false }),
      queryFn: () => {
        if (!id) {
          throw new UndefinedArgument();
        }
        return downloadItemThumbnail({ id, size }, queryConfig);
      },
      ...defaultQueryOptions,
      enabled: Boolean(id) && shouldFetch,
      staleTime: CONSTANT_KEY_STALE_TIME_MILLISECONDS,
    });
  };

// create a new thumbnail hook because of key content
/**
 * Fetch item's thumbnail url
 * @param id corresponding item's id for thumbnail, used to retrieve cache data and know if the item has a thumbnail
 * @param item corresponding item for thumbnail, used to know if the item has a thumbnail
 * @param size size of the thumbnail we want
 * @returns url of the thumbnail given size
 */
export const useItemThumbnailUrl =
  (queryConfig: QueryClientConfig) =>
  ({
    id,
    item,
    size = DEFAULT_THUMBNAIL_SIZE,
  }: {
    id?: UUID;
    item?: DiscriminatedItem;
    size?: string;
  }) => {
    const { defaultQueryOptions } = queryConfig;
    const queryClient = useQueryClient();
    let shouldFetch = true;
    if (id) {
      shouldFetch =
        queryClient.getQueryData<PackedItem>(itemKeys.single(id).content)
          ?.settings?.hasThumbnail ?? true;
    } else {
      shouldFetch = item?.settings?.hasThumbnail ?? true;
    }

    return useQuery({
      queryKey: itemKeys.single(id).thumbnail({ size, replyUrl: true }),
      queryFn: () => {
        if (!id) {
          throw new UndefinedArgument();
        }
        return downloadItemThumbnailUrl({ id, size }, queryConfig);
      },
      ...defaultQueryOptions,
      enabled: Boolean(id ?? item) && shouldFetch,
      staleTime: CONSTANT_KEY_STALE_TIME_MILLISECONDS,
    });
  };
