import { Member, UUID } from '@graasp/sdk';

import { ITEMS_ROUTE } from '../../routes.js';

export const buildRequestMembershipRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/memberships/requests`;

export const buildGetMembershipRequestsRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/memberships/requests`;

export const buildGetOwnMembershipRequestRoute = (id: UUID) =>
  `${ITEMS_ROUTE}/${id}/memberships/requests/own`;

export const buildDeleteMembershipRequestRoute = (args: {
  itemId: UUID;
  memberId: Member['id'];
}) => `${ITEMS_ROUTE}/${args.itemId}/memberships/requests/${args.memberId}`;
