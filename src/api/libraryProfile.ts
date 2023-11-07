import { UUID } from '@graasp/sdk';

import { PartialQueryConfigForApi } from '../types';
import {
  GET_OWN_LIBRARY_PROFILE,
  LIBRARY_PROFILE_ROUTE,
  buildGetMemberProfileRoute,
} from './routes';

export const getOwnProfile = ({ API_HOST, axios }: PartialQueryConfigForApi) =>
  axios.get(`${API_HOST}/${GET_OWN_LIBRARY_PROFILE}`).then(({ data }) => data);

export const getMemberProfile = (
  memberId: UUID,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get(`${API_HOST}/${buildGetMemberProfileRoute(memberId)}`)
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
    .post(`${API_HOST}/${LIBRARY_PROFILE_ROUTE}`, {
      bio,
      twitterLink,
      facebookLink,
      linkedinLink,
      visibility,
    })
    .then(({ data }) => data);

export const editProfile = async (
  arg: Partial<PostProfilePayloadType>,
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .patch(`${API_HOST}/${LIBRARY_PROFILE_ROUTE}`, arg)
    .then(({ data }) => data);
