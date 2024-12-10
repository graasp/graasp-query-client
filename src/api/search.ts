import { MeiliSearchResults, Tag, TagCategory } from '@graasp/sdk';

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
  query?: string;
  tags?: Record<TagCategory, Tag['name'][]>;
  isPublishedRoot?: boolean;
  langs?: string[];
};

export const searchPublishedItems = async (
  query: MeiliSearchProps,
  { API_HOST, axios }: PartialQueryConfigForApi,
) => {
  return axios
    .post<
      MeiliSearchResults['results'][0]
    >(`${API_HOST}/${SEARCH_PUBLISHED_ITEMS_ROUTE}`, query)
    .then(({ data }) => data);
};

export const getSearchFacets = async (
  query: MeiliSearchProps & { facetName: string },
  { API_HOST, axios }: PartialQueryConfigForApi,
) => {
  return axios
    .post<
      Record<string, number>
    >(`${API_HOST}/${buildGetSearchFacets(query.facetName)}`, query)
    .then(({ data }) => data);
};
