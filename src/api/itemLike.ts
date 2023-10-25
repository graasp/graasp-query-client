import { UUID } from '@graasp/sdk';

import { PartialQueryConfigForApi } from '../types';
import { verifyAuthentication } from './axios';
import {
  buildDeleteItemLikeRoute,
  buildGetItemLikesRoute,
  buildGetLikesForMemberRoute,
  buildPostItemLikeRoute,
} from './routes';

export const getLikedItems = async (
  memberId: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .get(`${API_HOST}/${buildGetLikesForMemberRoute(memberId)}`)
      .then(({ data }) => data),
  );

export const getItemLikes = async (
  id: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get(`${API_HOST}/${buildGetItemLikesRoute(id)}`)
    .then(({ data }) => data);

export const postItemLike = async (
  itemId: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .post(`${API_HOST}/${buildPostItemLikeRoute(itemId)}`)
      .then(({ data }) => data),
  );

export const deleteItemLike = async (
  itemId: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .delete(`${API_HOST}/${buildDeleteItemLikeRoute(itemId)}`)
      .then(({ data }) => data),
  );
