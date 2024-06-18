import { PublicProfile, UUID } from '@graasp/sdk';

import {
  GET_OWN_PROFILE,
  MEMBERS_ROUTE,
  PUBLIC_PROFILE_ROUTE,
  buildGetPublicProfileRoute,
} from '../routes.js';
import { PartialQueryConfigForApi } from '../types.js';

export const getOwnProfile = ({ API_HOST, axios }: PartialQueryConfigForApi) =>
  axios
    .get<PublicProfile | null>(
      `${API_HOST}/${MEMBERS_ROUTE}/${GET_OWN_PROFILE}`,
    )
    .then(({ data }) => data);

export const getPublicProfile = (
  memberId: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get<PublicProfile | null>(
      `${API_HOST}/${MEMBERS_ROUTE}/${buildGetPublicProfileRoute(memberId)}`,
    )
    .then(({ data }) => data);

export type PostPublicProfilePayloadType = {
  bio: string;
  twitterID?: string;
  facebookID?: string;
  linkedinID?: string;
  visibility?: boolean;
};

export const postPublicProfile = async (
  {
    bio,
    twitterID,
    facebookID,
    linkedinID,
    visibility = false,
  }: PostPublicProfilePayloadType,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .post(`${API_HOST}/${MEMBERS_ROUTE}/${PUBLIC_PROFILE_ROUTE}`, {
      bio,
      twitterID,
      facebookID,
      linkedinID,
      visibility,
    })
    .then(({ data }) => data);

export const patchPublicProfile = async (
  arg: Partial<PostPublicProfilePayloadType>,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .patch(`${API_HOST}/${MEMBERS_ROUTE}/${PUBLIC_PROFILE_ROUTE}`, arg)
    .then(({ data }) => data);
