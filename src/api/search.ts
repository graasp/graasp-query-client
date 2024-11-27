import { INDEX_NAME, MeiliSearchResults, Tag } from '@graasp/sdk';

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

export const searchPublishedItems = async (
  {
    query: q,
    disciplines,
    levels,
    resourceTypes,
    isPublishedRoot = true,
    limit,
    offset,
    sort,
    attributesToCrop,
    cropLength,
    highlightPreTag,
    highlightPostTag,
    langs,
  }: {
    query?: string;
    disciplines: Tag['name'][];
    levels: Tag['name'][];
    resourceTypes: Tag['name'][];
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
    highlightPreTag,
    highlightPostTag,
  };

  // handle filters
  const disciplineFilter = disciplines
    ? `disciplines IN [${disciplines.join(',')}]`
    : '';
  const levelFilter = levels ? `levels IN [${levels.join(',')}]` : '';
  const resourceTypeFilter = resourceTypes
    ? `resourceTypes IN [${resourceTypes.join(',')}]`
    : '';

  const isPublishedFilter = isPublishedRoot
    ? `isPublishedRoot = ${isPublishedRoot}`
    : '';
  const langsFilter = langs?.length ? `lang IN [${langs.join(',')}]` : '';
  const filters = [
    disciplineFilter,
    levelFilter,
    resourceTypeFilter,
    isPublishedFilter,
    langsFilter,
  ]
    .filter(Boolean)
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
