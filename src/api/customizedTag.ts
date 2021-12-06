import { QueryClientConfig, UUID } from '../types';
import { buildGetCustomizedTagsRoute, buildPostCustomizedTagsRoute } from './routes';
import { DEFAULT_GET, DEFAULT_POST, failOnError } from './utils';

export const getCustomizedTags = async (itemId: UUID, { API_HOST }: QueryClientConfig) => {
  const res = await fetch(`${API_HOST}/${buildGetCustomizedTagsRoute(itemId)}`, DEFAULT_GET).then(
    failOnError,
  );
  return res.json();
};

// payload: flagId, itemId
export const postCustomizedTags = async (
    { itemId, values }: { itemId: UUID; values: string[] },
    { API_HOST }: QueryClientConfig,
  ) => {
    const res = await fetch(`${API_HOST}/${buildPostCustomizedTagsRoute(itemId)}`, {
      ...DEFAULT_POST,
      body: JSON.stringify({ values }),
    }).then(failOnError);
    return res.json();
  };
