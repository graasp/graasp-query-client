import { UUID } from '@graasp/sdk';

import { QueryClientConfig } from '../types';
import configureAxios, { verifyAuthentication } from './axios';
import {
  buildDeleteItemLikeRoute,
  buildGetItemLikesRoute,
  buildGetLikesForMemberRoute,
  buildPostItemLikeRoute,
} from './routes';

const axios = configureAxios();

export const getLikedItems = async (
  memberId: UUID,
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(() =>
    axios
      .get(`${API_HOST}/${buildGetLikesForMemberRoute(memberId)}`)
      .then(({ data }) => data),
  );

export const getItemLikes = async (id: UUID, { API_HOST }: QueryClientConfig) =>
  axios
    .get(`${API_HOST}/${buildGetItemLikesRoute(id)}`)
    .then(({ data }) => data);

export const postItemLike = async (
  itemId: UUID,
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(() =>
    axios
      .post(`${API_HOST}/${buildPostItemLikeRoute(itemId)}`)
      .then(({ data }) => data),
  );

export const deleteItemLike = async (
  itemId: UUID,
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(() =>
    axios
      .delete(`${API_HOST}/${buildDeleteItemLikeRoute(itemId)}`)
      .then(({ data }) => data),
  );
