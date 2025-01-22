import { DiscriminatedItem, PackedItem, UUID } from '@graasp/sdk';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import {
  CONSTANT_KEY_STALE_TIME_MILLISECONDS,
  DEFAULT_THUMBNAIL_SIZE,
} from '../../config/constants.js';
import { UndefinedArgument } from '../../config/errors.js';
import { itemKeys } from '../../keys.js';
import { QueryClientConfig } from '../../types.js';
import { downloadItemThumbnailUrl } from './api.js';

// create a new thumbnail hook because of key content
/**
 * Fetch item's thumbnail url. At least id or item should be provided.
 * @param id corresponding item's id for thumbnail
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
    const itemId = id ?? item?.id;

    if (item) {
      shouldFetch = item?.settings?.hasThumbnail ?? true;
    } else if (itemId) {
      shouldFetch =
        queryClient.getQueryData<PackedItem>(itemKeys.single(id).content)
          ?.settings?.hasThumbnail ?? true;
    }

    return useQuery({
      queryKey: itemKeys.single(itemId).thumbnail({ size, replyUrl: true }),
      queryFn: () => {
        if (!itemId) {
          throw new UndefinedArgument();
        }
        return downloadItemThumbnailUrl({ id: itemId, size }, queryConfig);
      },
      ...defaultQueryOptions,
      enabled: Boolean(itemId) && shouldFetch,
      staleTime: CONSTANT_KEY_STALE_TIME_MILLISECONDS,
    });
  };
