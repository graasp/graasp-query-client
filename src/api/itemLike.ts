import { ItemLike, PackedItemLike, UUID } from '@graasp/sdk';

import {
  buildDeleteItemLikeRoute,
  buildGetItemLikesRoute,
  buildGetLikesForMemberRoute,
  buildPostItemLikeRoute,
} from '../routes.js';
import { PartialQueryConfigForApi } from '../types.js';
import { verifyAuthentication } from './axios.js';

export const getLikedItems = async (
  memberId: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .get<
        PackedItemLike[]
      >(`${API_HOST}/${buildGetLikesForMemberRoute(memberId)}`)
      .then(({ data }) => data),
  );

export const getItemLikes = async (
  id: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get<ItemLike[]>(`${API_HOST}/${buildGetItemLikesRoute(id)}`)
    .then(({ data }) => data);

export const postItemLike = async (
  itemId: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .post<ItemLike>(`${API_HOST}/${buildPostItemLikeRoute(itemId)}`)
      .then(({ data }) => data),
  );

export const deleteItemLike = async (
  itemId: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .delete<ItemLike>(`${API_HOST}/${buildDeleteItemLikeRoute(itemId)}`)
      .then(({ data }) => data),
  );
