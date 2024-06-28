import { UUID } from '@graasp/sdk';

import { DEFAULT_THUMBNAIL_SIZE } from '../config/constants.js';

export const MEMBERS_ROUTE = `members`;

export const buildGetCurrentMember = () => `${MEMBERS_ROUTE}/current`;
export const buildPostMemberEmailUpdate = () =>
  `${MEMBERS_ROUTE}/current/email/change`;

export const buildGetMembersByEmail = (emails: string[]) =>
  `${MEMBERS_ROUTE}/search?${new URLSearchParams(emails.map((e) => ['email', e.toLowerCase()]))}`;

export const buildGetMembersById = (ids: UUID[]) =>
  `${MEMBERS_ROUTE}?${new URLSearchParams(ids.map((id) => ['id', id]))}`;

// Member CRUD
export const buildGetMember = (id: UUID) => `${MEMBERS_ROUTE}/${id}`;
export const buildPatchMember = (id: UUID) => `${MEMBERS_ROUTE}/${id}`;
export const buildDeleteMemberRoute = (id: UUID) => `${MEMBERS_ROUTE}/${id}`;

// Password
export const buildUpdateMemberPasswordRoute = () =>
  `${MEMBERS_ROUTE}/update-password`;

// Storage
export const buildGetMemberStorage = () => `${MEMBERS_ROUTE}/current/storage`;

// Avatar
export const buildUploadAvatarRoute = () => `${MEMBERS_ROUTE}/avatar`;
export const buildDownloadAvatarRoute = ({
  id,
  replyUrl,
  size = DEFAULT_THUMBNAIL_SIZE,
}: {
  id: UUID;
  replyUrl: boolean;
  size?: string;
}) =>
  `${MEMBERS_ROUTE}/${id}/avatar/${size}?${new URLSearchParams({ replyUrl: replyUrl.toString() })}`;

// Actions
export const buildGetMemberActionsRoute = ({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) =>
  `${MEMBERS_ROUTE}/actions?${new URLSearchParams({
    startDate,
    endDate,
  })}`;

// Public Profile
export const PUBLIC_PROFILE = `profile`;
export const buildGetOwnPublicProfile = () =>
  `${MEMBERS_ROUTE}/${PUBLIC_PROFILE}/own`;
export const buildPostPublicProfileRoute = () =>
  `${MEMBERS_ROUTE}/${PUBLIC_PROFILE}`;
export const buildPatchPublicProfileRoute = () =>
  `${MEMBERS_ROUTE}/${PUBLIC_PROFILE}`;
export const buildGetPublicProfileRoute = (memberId: UUID) =>
  `${MEMBERS_ROUTE}/${PUBLIC_PROFILE}/${memberId}`;

// Subscriptions
export const SUBSCRIPTION_ROUTE = 'subscriptions';
export const GET_PLANS_ROUTE = `${MEMBERS_ROUTE}/${SUBSCRIPTION_ROUTE}/plans`;
export const GET_OWN_PLAN_ROUTE = `${MEMBERS_ROUTE}/${SUBSCRIPTION_ROUTE}/plans/own`;
export const buildGetPlanRoute = (planId: string) =>
  `${MEMBERS_ROUTE}/${SUBSCRIPTION_ROUTE}/plans/${planId}`;
export const buildChangePlanRoute = (planId: string) =>
  `${MEMBERS_ROUTE}/${SUBSCRIPTION_ROUTE}/plans/${planId}`;
export const GET_CARDS_ROUTE = `${MEMBERS_ROUTE}/${SUBSCRIPTION_ROUTE}/cards`;
export const buildSetDefaultCardRoute = (cardId: string) =>
  `${MEMBERS_ROUTE}/${SUBSCRIPTION_ROUTE}/cards/${cardId}/default`;
export const CREATE_SETUP_INTENT_ROUTE = `${MEMBERS_ROUTE}/${SUBSCRIPTION_ROUTE}/setup-intent`;
export const GET_CURRENT_CUSTOMER = `${MEMBERS_ROUTE}/${SUBSCRIPTION_ROUTE}/customer/current`;
