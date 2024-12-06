import { TagCategory } from '@graasp/sdk';

export const buildGetTagCountsRoute = ({
  search,
  category,
}: {
  search?: string;
  category?: TagCategory;
}) => {
  const searchParams = new URLSearchParams();

  // searchParams
  if (search) {
    searchParams.set('search', search);
  }
  if (category) {
    searchParams.set('category', category);
  }
  return `tags?${searchParams}`;
};
