import { Category, DiscriminatedItem } from '@graasp/sdk';

import { QueryClientConfig } from '../types';
import configureAxios from './axios';
import { SEARCH_PUBLISHED_ITEMS_ROUTE } from './routes';

const axios = configureAxios();

/* eslint-disable import/prefer-default-export */
export const searchPublishedItems = async (
  {
    query: q,
    categories,
    isPublishedRoot,
  }: {
    query?: string;
    categories?: Category['id'][][];
    isPublishedRoot?: boolean;
  },
  { API_HOST }: QueryClientConfig,
): Promise<DiscriminatedItem[]> => {
  const categoriesFilter = categories
    ?.map(
      (categoriesForType) => `categories IN [${categoriesForType.join(',')}]`,
    )
    ?.join(' AND ');

  const isPublishedFilter = isPublishedRoot
    ? `isPublishedRoot = ${isPublishedRoot}`
    : '';

  const query: {
    indexUid: string;
    attributesToHighlight: string[];
    q?: string;
    filter?: string;
  } = {
    indexUid: 'itemIndex',
    attributesToHighlight: ['name', 'description', 'content'],
    q,
  };

  const filters = [categoriesFilter, isPublishedFilter]
    .filter((v) => v)
    .join(' AND ');

  if (filters) {
    query.filter = filters;
  }

  return axios
    .post(`${API_HOST}/${SEARCH_PUBLISHED_ITEMS_ROUTE}`, {
      queries: [query],
    })
    .then(({ data }) => data);
};
