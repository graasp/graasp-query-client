import {
  CompleteMembershipRequest,
  Member,
  MembershipRequestStatus,
  UUID,
} from '@graasp/sdk';

import { PartialQueryConfigForApi } from '../../types.js';
import {
  buildDeleteMembershipRequestRoute,
  buildGetOwnMembershipRequestRoute,
  buildRequestMembershipRoute,
} from './routes.js';

export const requestMembership = async (
  { id }: { id: UUID },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .post(`${API_HOST}/${buildRequestMembershipRoute(id)}`)
    .then(({ data }) => data);

export const getOwnMembershipRequest = async (
  { id }: { id: UUID },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get<{
      status: MembershipRequestStatus;
    }>(`${API_HOST}/${buildGetOwnMembershipRequestRoute(id)}`)
    .then(({ data }) => data);

export const getMembershipRequests = async (
  { id }: { id: UUID },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .get<
      CompleteMembershipRequest[]
    >(`${API_HOST}/${buildRequestMembershipRoute(id)}`)
    .then(({ data }) => data);

export const deleteMembershipRequest = async (
  { itemId, memberId }: { itemId: UUID; memberId: Member['id'] },
  { API_HOST, axios }: PartialQueryConfigForApi,
) =>
  axios
    .delete(
      `${API_HOST}/${buildDeleteMembershipRequestRoute({ itemId, memberId })}`,
    )
    .then(({ data }) => data);
