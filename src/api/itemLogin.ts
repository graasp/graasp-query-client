import {
  ItemLoginSchema,
  ItemLoginSchemaType,
  Member,
  UUID,
} from '@graasp/sdk';

import { PartialQueryConfigForApi } from '../types';
import { verifyAuthentication } from './axios';
import {
  buildDeleteItemLoginSchemaRoute,
  buildGetItemLoginSchemaRoute,
  buildGetItemLoginSchemaTypeRoute,
  buildPostItemLoginSignInRoute,
  buildPutItemLoginSchemaRoute,
} from './routes';

export const postItemLoginSignIn = async (
  {
    itemId,
    username,
    memberId,
    password,
  }: { itemId: UUID; username?: string; memberId?: UUID; password?: string },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .post<Member>(`${API_HOST}/${buildPostItemLoginSignInRoute(itemId)}`, {
      username: username?.trim(),
      memberId: memberId?.trim(),
      password,
    })
    .then(({ data }) => data);

export const getItemLoginSchema = async (
  id: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get<ItemLoginSchema>(`${API_HOST}/${buildGetItemLoginSchemaRoute(id)}`)
    .then(({ data }) => data);

export const getItemLoginSchemaType = async (
  id: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get<ItemLoginSchemaType>(
      `${API_HOST}/${buildGetItemLoginSchemaTypeRoute(id)}`,
    )
    .then(({ data }) => data);

export const putItemLoginSchema = async (
  { itemId, type }: { itemId: UUID; type: ItemLoginSchemaType },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .put<ItemLoginSchema>(
        `${API_HOST}/${buildPutItemLoginSchemaRoute(itemId)}`,
        {
          type,
        },
      )
      .then(({ data }) => data),
  );

export const deleteItemLoginSchema = async (
  { itemId }: { itemId: UUID },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios.delete<void>(
      `${API_HOST}/${buildDeleteItemLoginSchemaRoute(itemId)}`,
    ),
  );
