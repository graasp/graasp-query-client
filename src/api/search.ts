import { INDEX_NAME, MeiliSearchResults, Tag, TagCategory } from '@graasp/sdk';

import {
  SEARCH_PUBLISHED_ITEMS_ROUTE,
  buildGetSearchFacets,
} from '../routes.js';
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
    tags,
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
    tags?: Record<TagCategory, Tag['name'][]>;
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
  const disciplineFilter = tags?.[TagCategory.Discipline]
    ? `disciplines IN [${tags?.[TagCategory.Discipline].join(',')}]`
    : '';
  const levelFilter = tags?.[TagCategory.Level]
    ? `levels IN [${tags?.[TagCategory.Level].join(',')}]`
    : '';
  const resourceTypeFilter = tags?.[TagCategory.ResourceType]
    ? `resourceTypes IN [${tags?.[TagCategory.ResourceType].join(',')}]`
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

export const getSearchFacets = async (
  args: {
    facetName: string;
    facetQuery?: string;
  },
  { API_HOST, axios }: PartialQueryConfigForApi,
) => {
  return axios
    .get<any>(`${API_HOST}/${buildGetSearchFacets(args)}`)
    .then(({ data }) => data);
};
