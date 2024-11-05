import { Category, INDEX_NAME, MeiliSearchResults } from '@graasp/sdk';

import { SEARCH_PUBLISHED_ITEMS_ROUTE } from '../routes.js';
import { PartialQueryConfigForApi } from '../types.js';

export type MeiliSearchProps = {
  limit?: number;
  offset?: number;
  sort?: string[];
  attributesToCrop?: string[];
  cropLength?: number;
  highlightPreVisibility?: string;
  highlightPostVisibility?: string;
  page?: number;
  elementsPerPage?: number;
};

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
    highlightPreVisibility,
    highlightPostVisibility,
    langs,
  }: {
    query?: string;
    categories?: Category['id'][][];
    isPublishedRoot?: boolean;
    langs?: string[];
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
    highlightPreVisibility,
    highlightPostVisibility,
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
  const langsFilter = langs?.length ? `lang IN [${langs.join(',')}]` : '';
  const filters = [categoriesFilter, isPublishedFilter, langsFilter]
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
