import { failOnError, DEFAULT_POST, DEFAULT_GET, DEFAULT_PUT } from './utils';
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
) => {
  const res = await fetch(
    `${API_HOST}/${buildPostItemLoginSignInRoute(itemId)}`,
    {
      ...DEFAULT_POST,
      body: JSON.stringify({
        username: username?.trim(),
        memberId: memberId?.trim(),
        password,
      }),
    },
  ).then(failOnError);

  return res.ok;
};

export const getItemLogin = async (
  id: UUID,
  { API_HOST }: QueryClientConfig,
) => {
  const res = await fetch(
    `${API_HOST}/${buildGetItemLoginRoute(id)}`,
    DEFAULT_GET,
  ).then(failOnError);

  return res.json();
};

export const putItemLoginSchema = async (
  { itemId, loginSchema }: { itemId: UUID; loginSchema: string },
  { API_HOST }: QueryClientConfig,
) => {
  const res = await fetch(`${API_HOST}/${buildPutItemLoginSchema(itemId)}`, {
    ...DEFAULT_PUT,
    body: JSON.stringify({ loginSchema }),
  }).then(failOnError);

  return res.json();
};
