import { ThumbnailSize } from '@graasp/sdk';

import { StatusCodes } from 'http-status-codes';

// React Query Configs

// duration for which query data is considered "fresh", meaning every access to that entry will be from cached data, no refetch.
export const STALE_TIME_MILLISECONDS = 3 * 1000; // default is 3 seconds to deduplicate calls to the same resource on load.
// time during which to keep the cache entry of a query that is not on screen.
// increasing this time allows to keep data between screens for example.
export const CACHE_TIME_MILLISECONDS = 1000 * 60 * 5; // default is 5 min
export const CONSTANT_KEY_STALE_TIME_MILLISECONDS = 1000 * 60 * 15; // default is 15 min

export const FALLBACK_TO_PUBLIC_FOR_STATUS_CODES = [
  StatusCodes.UNAUTHORIZED,
  StatusCodes.FORBIDDEN,
];

export const DEFAULT_THUMBNAIL_SIZE = ThumbnailSize.Small;

export const PAGINATED_ITEMS_PER_PAGE = 8;
