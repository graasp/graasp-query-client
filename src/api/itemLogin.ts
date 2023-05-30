import { ItemLoginSchemaType, UUID } from '@graasp/sdk';

import { QueryClientConfig } from '../types';
import configureAxios, { verifyAuthentication } from './axios';
import {
  buildDeleteItemLoginSchemaRoute, // buildGetItemLoginRoute,
  buildGetItemLoginSchemaRoute,
  buildGetItemLoginSchemaTypeRoute,
  buildPostItemLoginSignInRoute,
  buildPutItemLoginSchemaRoute,
} from './routes';

const axios = configureAxios();

export const postItemLoginSignIn = async (
  {
    itemId,
    username,
    memberId,
    password,
  }: { itemId: UUID; username?: string; memberId?: UUID; password?: string },
  { API_HOST }: QueryClientConfig,
) =>
  axios
    .post(`${API_HOST}/${buildPostItemLoginSignInRoute(itemId)}`, {
      username: username?.trim(),
      memberId: memberId?.trim(),
      password,
    })
    .then(({ data }) => data);

export const getItemLoginSchema = async (
  id: UUID,
  { API_HOST }: QueryClientConfig,
) =>
  axios
    .get(`${API_HOST}/${buildGetItemLoginSchemaRoute(id)}`)
    .then(({ data }) => data);

export const getItemLoginSchemaType = async (
  id: UUID,
  { API_HOST }: QueryClientConfig,
): Promise<ItemLoginSchemaType> =>
  axios
    .get(`${API_HOST}/${buildGetItemLoginSchemaTypeRoute(id)}`)
    .then(({ data }) => data);

export const putItemLoginSchema = async (
  { itemId, type }: { itemId: UUID; type: ItemLoginSchemaType },
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(() =>
    axios
      .put(`${API_HOST}/${buildPutItemLoginSchemaRoute(itemId)}`, {
        type,
      })
      .then(({ data }) => data),
  );

export const deleteItemLoginSchema = async (
  { itemId }: { itemId: UUID },
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(() =>
    axios
      .delete(`${API_HOST}/${buildDeleteItemLoginSchemaRoute(itemId)}`)
      .then(({ data }) => data),
  );
