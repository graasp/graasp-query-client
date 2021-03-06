import { List } from 'immutable';
import {
  buildDeleteItemLikeRoute,
  buildGetLikeCountRoute,
  buildGetLikedItemsRoute,
  buildPostItemLikeRoute,
} from './routes';
import { QueryClientConfig, UUID } from '../types';
import configureAxios, { verifyAuthentication } from './axios';

const axios = configureAxios();

export const getLikedItems = async (
  memberId: UUID,
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(() =>
    axios
      .get(`${API_HOST}/${buildGetLikedItemsRoute(memberId)}`)
      .then(({ data }) => List(data)),
  );

// TODO: make a public one
export const getLikeCount = async (id: UUID, { API_HOST }: QueryClientConfig) =>
  verifyAuthentication(() =>
    axios
      .get(`${API_HOST}/${buildGetLikeCountRoute(id)}`)
      .then(({ data }) => data),
  );

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
  id: UUID,
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(() =>
    axios
      .delete(`${API_HOST}/${buildDeleteItemLikeRoute(id)}`)
      .then(({ data }) => data),
  );
