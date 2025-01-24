import { PublicProfile, UUID } from '@graasp/sdk';

import { StatusCodes } from 'http-status-codes';

import { PartialQueryConfigForApi } from '../../types.js';
import {
  buildGetOwnPublicProfileRoute,
  buildGetPublicProfileRoute,
  buildPatchPublicProfileRoute,
  buildPostPublicProfileRoute,
} from '../routes.js';

export const getOwnProfile = ({ API_HOST, axios }: PartialQueryConfigForApi) =>
  axios
    .get<PublicProfile | null>(`${API_HOST}/${buildGetOwnPublicProfileRoute()}`)
    .then(({ status, data }) => {
      if (status === StatusCodes.NO_CONTENT) {
        return null;
      } else {
        return data;
      }
    });

export const getPublicProfile = (
  memberId: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get<PublicProfile | null>(
      `${API_HOST}/${buildGetPublicProfileRoute(memberId)}`,
    )
    .then(({ status, data }) => {
      if (status === StatusCodes.NO_CONTENT) {
        return null;
      } else {
        return data;
      }
    });

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
    .post(`${API_HOST}/${buildPostPublicProfileRoute()}`, {
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
    .patch(`${API_HOST}/${buildPatchPublicProfileRoute()}`, arg)
    .then(({ data }) => data);
