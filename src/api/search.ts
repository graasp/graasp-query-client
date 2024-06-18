import { Category, INDEX_NAME, MeiliSearchResults } from '@graasp/sdk';

import { SEARCH_PUBLISHED_ITEMS_ROUTE } from '../routes.js';
import { PartialQueryConfigForApi } from '../types.js';

export type MeiliSearchProps = {
  limit?: number;
  offset?: number;
  sort?: string[];
  attributesToCrop?: string[];
  cropLength?: number;
  highlightPreTag?: string;
  highlightPostTag?: string;
  page?: number;
  elementsPerPage?: number;
};

/* eslint-disable import/prefer-default-export */
export const searchPublishedItems = async (
  {
    query: q,
    categories,
    isPublishedRoot = true,
    limit,
    offset,
    sort,
    attributesToCrop,
    cropLength,
    highlightPreTag,
    highlightPostTag,
  }: {
    query?: string;
    categories?: Category['id'][][];
    isPublishedRoot?: boolean;
  } & MeiliSearchProps,
  { API_HOST, axios }: PartialQueryConfigForApi,
) => {
  const query: {
    indexUid: string;
    attributesToHighlight: string[];
    q?: string;
    filter?: string;
  } & MeiliSearchProps = {
    indexUid: INDEX_NAME,
    attributesToHighlight: ['name', 'description', 'content', 'creator'],
    attributesToCrop,
    cropLength,
    q,
    limit,
    offset,
    sort,
    highlightPreTag,
    highlightPostTag,
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
    .post<MeiliSearchResults>(`${API_HOST}/${SEARCH_PUBLISHED_ITEMS_ROUTE}`, {
      queries: [query],
    })
    .then(({ data }) => data);
};
