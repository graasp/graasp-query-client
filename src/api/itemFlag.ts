import { QueryClientConfig, UUID } from '../types';
import { buildPostItemFlagRoute, GET_FLAGS_ROUTE } from './routes';
import { DEFAULT_GET, DEFAULT_POST, failOnError } from './utils';

export const getFlags = async ({ API_HOST }: QueryClientConfig) => {
  const res = await fetch(`${API_HOST}/${GET_FLAGS_ROUTE}`, DEFAULT_GET).then(
    failOnError,
  );

  return res.json();
};

// payload: flagId, itemId
export const postItemFlag = async (
  { flagId, itemId }: { flagId: UUID; itemId: string },
  { API_HOST }: QueryClientConfig,
) => {
  const res = await fetch(`${API_HOST}/${buildPostItemFlagRoute(itemId)}`, {
    ...DEFAULT_POST,
    body: JSON.stringify({ flagId }),
  }).then(failOnError);

  return res.json();
};
