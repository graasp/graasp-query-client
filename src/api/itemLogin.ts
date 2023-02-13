import { UUID } from '@graasp/sdk';

import { QueryClientConfig } from '../types';
import configureAxios, { verifyAuthentication } from './axios';
import {
  buildGetItemLoginRoute,
  buildPostItemLoginSignInRoute,
  buildPutItemLoginSchema,
} from './routes';

const axios = configureAxios();

export const postItemLoginSignIn = async (
  {
    itemId,
    username,
    memberId,
    password,
  }: { itemId: UUID; username: string; memberId: UUID; password: string },
  { API_HOST }: QueryClientConfig,
) =>
  axios
    .post(`${API_HOST}/${buildPostItemLoginSignInRoute(itemId)}`, {
      username: username?.trim(),
      memberId: memberId?.trim(),
      password,
    })
    .then(({ data }) => data);

export const getItemLogin = async (id: UUID, { API_HOST }: QueryClientConfig) =>
  axios
    .get(`${API_HOST}/${buildGetItemLoginRoute(id)}`)
    .then(({ data }) => data);

export const putItemLoginSchema = async (
  { itemId, loginSchema }: { itemId: UUID; loginSchema: string },
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(() =>
    axios
      .put(`${API_HOST}/${buildPutItemLoginSchema(itemId)}`, {
        loginSchema,
      })
      .then(({ data }) => data),
  );
