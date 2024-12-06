import { TagCategory } from '@graasp/sdk';

export const tagKeys = {
  search: (args: { search?: string; category?: TagCategory }) => ['tags', args],
};
