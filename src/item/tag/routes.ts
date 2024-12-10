import { DiscriminatedItem, Tag } from '@graasp/sdk';

import { ITEMS_ROUTE } from '../routes.js';

export const buildGetTagsByItemRoute = ({
  itemId,
}: {
  itemId: DiscriminatedItem['id'];
}) => {
  return `${ITEMS_ROUTE}/${itemId}/tags`;
};

export const buildAddTagRoute = ({
  itemId,
}: {
  itemId: DiscriminatedItem['id'];
}) => {
  return `${ITEMS_ROUTE}/${itemId}/tags`;
};

export const buildRemoveTagRoute = ({
  itemId,
  tagId,
}: {
  itemId: DiscriminatedItem['id'];
  tagId: Tag['id'];
}) => {
  return `${ITEMS_ROUTE}/${itemId}/tags/${tagId}`;
};
