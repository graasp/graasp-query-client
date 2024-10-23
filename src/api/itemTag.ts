import { ItemTag, ItemTagType, UUID } from '@graasp/sdk';

import { buildDeleteItemTagRoute, buildPostItemTagRoute } from '../routes.js';
import { PartialQueryConfigForApi } from '../types.js';
import { verifyAuthentication } from './axios.js';

// payload: tagId, itemPath, creator
export const postItemTag = async (
  { itemId, type }: { itemId: UUID; type: ItemTagType },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .post<ItemTag>(`${API_HOST}/${buildPostItemTagRoute({ itemId, type })}`)
      .then(({ data }) => data),
  );

export const deleteItemTag = async (
  { itemId, type }: { itemId: UUID; type: `${ItemTagType}` | ItemTagType },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .delete<ItemTag>(
        `${API_HOST}/${buildDeleteItemTagRoute({ itemId, type })}`,
      )
      .then(({ data }) => data),
  );
