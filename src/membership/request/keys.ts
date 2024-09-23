import { UUID } from '@graasp/sdk';

/**
 * Contexts
 */
const MEMBERSHIP_REQUESTS_CONTEXT = 'membership-requests';

export const membershipRequestsKeys = {
  // keys for a single item
  single: (itemId?: UUID) => [MEMBERSHIP_REQUESTS_CONTEXT, itemId] as const,
  own: (itemId?: UUID) => [MEMBERSHIP_REQUESTS_CONTEXT, itemId, 'own'] as const,
};
