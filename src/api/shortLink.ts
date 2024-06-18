import {
  ShortLink,
  ShortLinkAvailable,
  ShortLinkPatchPayload,
  ShortLinkPostPayload,
} from '@graasp/sdk';

import {
  buildDeleteShortLinkRoute,
  buildGetShortLinkAvailableRoute,
  buildGetShortLinksItemRoute,
  buildPatchShortLinkRoute,
  buildPostShortLinkRoute,
} from '../routes.js';
import { PartialQueryConfigForApi } from '../types.js';
import { verifyAuthentication } from './axios.js';

export const getShortLinkAvailable = (
  alias: string,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .get<ShortLinkAvailable>(
        `${API_HOST}/${buildGetShortLinkAvailableRoute(alias)}`,
      )
      .then(({ data }) => data),
  );

export const getShortLinksItem = (
  itemId: string,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .get<ShortLink[]>(`${API_HOST}/${buildGetShortLinksItemRoute(itemId)}`)
      .then(({ data }) => data),
  );

export const deleteShortLink = (
  alias: string,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .delete<ShortLink>(`${API_HOST}/${buildDeleteShortLinkRoute(alias)}`)
      .then(({ data }) => data),
  );

export const postShortLink = async (
  shortLink: ShortLinkPostPayload,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .post<ShortLink>(`${API_HOST}/${buildPostShortLinkRoute()}`, {
        ...shortLink,
      })
      .then(({ data }) => data),
  );

export const patchShortLink = (
  alias: string,
  updatedPayload: ShortLinkPatchPayload,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  verifyAuthentication(() =>
    axios
      .patch<ShortLink>(`${API_HOST}/${buildPatchShortLinkRoute(alias)}`, {
        ...updatedPayload,
      })
      .then(({ data }) => data),
  );
