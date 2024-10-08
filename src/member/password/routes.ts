import { MEMBERS_ROUTE } from '../routes.js';

export const buildGetPasswordStatusRoute = () =>
  `${MEMBERS_ROUTE}/current/password/status`;
