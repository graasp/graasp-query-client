import {
  ItemLoginSchema,
  ItemLoginSchemaState,
  ItemLoginSchemaType,
  Member,
  UUID,
} from '@graasp/sdk';

import {
  buildGetItemLoginSchemaRoute,
  buildGetItemLoginSchemaTypeRoute,
  buildPostItemLoginSignInRoute,
  buildPutItemLoginSchemaRoute,
} from '../routes.js';
import { PartialQueryConfigForApi } from '../types.js';
import { verifyAuthentication } from './axios.js';

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
  {
    itemId,
    type,
    status,
  }: {
    itemId: UUID;
    type?: ItemLoginSchemaType;
    status?: ItemLoginSchemaState;
  },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .put<ItemLoginSchema>(
        `${API_HOST}/${buildPutItemLoginSchemaRoute(itemId)}`,
        {
          type,
          status,
        },
      )
      .then(({ data }) => data),
  );
