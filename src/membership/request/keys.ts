import { UUID } from '@graasp/sdk';

/**
 * Contexts
 */
const MEMBERSHIP_REQUESTS_CONTEXT = 'membership-requests';

export const membershipRequestsKeys = {
  own: [MEMBERSHIP_REQUESTS_CONTEXT, 'own'] as const,

  // keys for a single item
  single: (id?: UUID) => [MEMBERSHIP_REQUESTS_CONTEXT, id] as const,
};
