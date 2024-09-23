import { DiscriminatedItem } from '@graasp/sdk';

import { ITEMS_ROUTE } from '../routes.js';

export const buildEnroll = (itemId: DiscriminatedItem['id']) =>
  `${ITEMS_ROUTE}/${itemId}/enroll`;
