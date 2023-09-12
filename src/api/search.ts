import { Category, DiscriminatedItem } from '@graasp/sdk';

import { QueryClientConfig } from '../types';
import configureAxios from './axios';
import { SEARCH_PUBLISHED_ITEMS_ROUTE } from './routes';

const axios = configureAxios();

export type MeiliSearchProps = {
  limit?: number;
  sort?: string[];
  attributesToCrop?: string[];
  cropLength?: number;
};

/* eslint-disable import/prefer-default-export */
export const searchPublishedItems = async (
  {
    query: q,
    categories,
    isPublishedRoot,
    limit,
    sort,
    attributesToCrop,
    cropLength,
  }: {
    query?: string;
    categories?: Category['id'][][];
    isPublishedRoot?: boolean;
  } & MeiliSearchProps,
  { API_HOST }: QueryClientConfig,
): Promise<DiscriminatedItem[]> => {
  const query: {
    indexUid: string;
    attributesToHighlight: string[];
    q?: string;
    filter?: string;
  } & MeiliSearchProps = {
    indexUid: 'itemIndex',
    attributesToHighlight: ['name', 'description', 'content', 'creator'],
    attributesToCrop,
    cropLength,
    q,
    limit,
    sort,
  };

  // handle filters
  const categoriesFilter = categories
    ?.map(
      (categoriesForType) => `categories IN [${categoriesForType.join(',')}]`,
    )
    ?.join(' AND ');

  const isPublishedFilter = isPublishedRoot
    ? `isPublishedRoot = ${isPublishedRoot}`
    : '';
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
