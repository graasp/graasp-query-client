import axios from 'axios';
import {
  buildGetItemLoginRoute,
  buildPostItemLoginSignInRoute,
  buildPutItemLoginSchema,
} from './routes';
import { QueryClientConfig, UUID } from '../types';

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
      withCredentials: true,
      username: username?.trim(),
      memberId: memberId?.trim(),
      password,
    })
    .then(({ data }) => data);

export const getItemLogin = async (id: UUID, { API_HOST }: QueryClientConfig) =>
  axios
    .get(`${API_HOST}/${buildGetItemLoginRoute(id)}`, {
      withCredentials: true,
    })
    .then(({ data }) => data);

export const putItemLoginSchema = async (
  { itemId, loginSchema }: { itemId: UUID; loginSchema: string },
  { API_HOST }: QueryClientConfig,
) =>
  axios
    .put(`${API_HOST}/${buildPutItemLoginSchema(itemId)}`, {
      withCredentials: true,
      loginSchema,
    })
    .then(({ data }) => data);
