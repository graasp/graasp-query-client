import { UUID } from '@graasp/sdk';

import { PartialQueryConfigForApi } from '../types';
import {
  GET_OWN_PROFILE,
  PUBLIC_PROFILE_ROUTE,
  buildGetPublicProfileRoute,
} from './routes';

export const getOwnProfile = ({ API_HOST, axios }: PartialQueryConfigForApi) =>
  axios.get(`${API_HOST}/${GET_OWN_PROFILE}`).then(({ data }) => data);

export const getPublicProfile = (
  memberId: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get(`${API_HOST}/${buildGetPublicProfileRoute(memberId)}`)
    .then(({ data }) => data);

export type PostProfilePayloadType = {
  bio: string;
  twitterLink?: string;
  facebookLink?: string;
  linkedinLink?: string;
  visibility?: boolean;
};

export const postProfile = async (
  {
    bio,
    twitterLink,
    facebookLink,
    linkedinLink,
    visibility = false,
  }: PostProfilePayloadType,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .post(`${API_HOST}/${PUBLIC_PROFILE_ROUTE}`, {
      bio,
      twitterLink,
      facebookLink,
      linkedinLink,
      visibility,
    })
    .then(({ data }) => data);

export const patchProfile = async (
  arg: Partial<PostProfilePayloadType>,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .patch(`${API_HOST}/${PUBLIC_PROFILE_ROUTE}`, arg)
    .then(({ data }) => data);
