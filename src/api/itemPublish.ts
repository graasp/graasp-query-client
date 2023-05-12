import { Item, UUID } from '@graasp/sdk';

import { QueryClientConfig } from '../types';
import configureAxios, { verifyAuthentication } from './axios';
import {
  buildGetAllPublishedItemsRoute,
  buildGetItemPublishedInformationRoute,
  buildGetPublishedItemsForMemberRoute,
  buildItemPublishRoute,
  buildItemUnpublishRoute,
  buildManyGetItemPublishedInformationsRoute,
} from './routes';

const axios = configureAxios();

export const getAllPublishedItems = async (
  args: { categoryIds?: UUID[] },
  { API_HOST }: QueryClientConfig,
): Promise<Item[]> =>
  axios
    .get(`${API_HOST}/${buildGetAllPublishedItemsRoute(args?.categoryIds)}`)
    .then(({ data }) => data);

export const getPublishedItemsForMember = async (
  memberId: UUID,
  { API_HOST }: QueryClientConfig,
): Promise<Item[]> =>
  axios
    .get(`${API_HOST}/${buildGetPublishedItemsForMemberRoute(memberId)}`)
    .then(({ data }) => data);

export const getItemPublishedInformation = async (
  id: UUID,
  { API_HOST }: QueryClientConfig,
) =>
  axios
    .get(`${API_HOST}/${buildGetItemPublishedInformationRoute(id)}`)
    .then(({ data }) => data);

export const getManyItemPublishedInformations = async (
  ids: UUID[],
  { API_HOST }: QueryClientConfig,
) =>
  axios
    .get(`${API_HOST}/${buildManyGetItemPublishedInformationsRoute(ids)}`)
    .then(({ data }) => data);

export const publishItem = async (
  id: UUID,
  { API_HOST }: QueryClientConfig,
  notification?: boolean,
) =>
  verifyAuthentication(() =>
    axios
      .post(`${API_HOST}/${buildItemPublishRoute(id, notification)}`)
      .then(({ data }) => data),
  );

export const unpublishItem = async (
  id: UUID,
  { API_HOST }: QueryClientConfig,
) =>
  verifyAuthentication(() =>
    axios
      .post(`${API_HOST}/${buildItemUnpublishRoute(id)}`)
      .then(({ data }) => data),
  );
