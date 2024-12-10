import { HttpMethod, TagCategory } from '@graasp/sdk';

import axios from 'axios';
import nock from 'nock';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { mockHook, setUpTest } from '../../test/utils.js';
import { buildFacetKey, itemKeys } from '../keys.js';
import {
  SEARCH_PUBLISHED_ITEMS_ROUTE,
  buildGetSearchFacets,
} from '../routes.js';
import { DEFAULT_ELEMENTS_PER_PAGE } from './search.js';

const { hooks, wrapper, queryClient } = setUpTest();

const RESPONSE = {
  indexUid: 'itemIndex',
  hits: [
    {
      name: 'lettre',
      description: '',
      content: '',
      id: '4ad19906-a3e2-47ed-b5c9-e7764889a980',
      type: 'folder',
      isPublishedRoot: true,
      createdAt: '2023-09-06T11:50:32.894Z',
      updatedAt: '2023-09-06T11:50:32.894Z',
      _formatted: {
        name: '<em>lettre</em>',
        description: '',
        content: '',
        id: '4ad19906-a3e2-47ed-b5c9-e7764889a980',
        type: 'folder',
        isPublishedRoot: true,
        createdAt: '2023-09-06T11:50:32.894Z',
        updatedAt: '2023-09-06T11:50:32.894Z',
      },
    },
    {
      name: 'name',
      description: 'my lettre is for oyu to sijefk',
      content: '',
      id: '0bac7f97-9c06-437a-9db4-c46f97bc8605',
      type: 'folder',
      isPublishedRoot: true,
      createdAt: '2023-09-06T11:50:32.894Z',
      updatedAt: '2023-09-06T11:50:32.894Z',
      _formatted: {
        name: 'name',
        description: 'my <em>lettre</em> is for oyu to sijefk',
        content: '',
        id: '0bac7f97-9c06-437a-9db4-c46f97bc8605',
        type: 'folder',
        isPublishedRoot: true,
        createdAt: '2023-09-06T11:50:32.894Z',
        updatedAt: '2023-09-06T11:50:32.894Z',
      },
    },
    {
      name: 'child of name',
      description: 'some description',
      content: '',
      id: '1bac7f97-9c06-437a-9db4-c46f97bc8605',
      type: 'folder',
      isPublishedRoot: false,
      createdAt: '2023-09-06T11:50:32.894Z',
      updatedAt: '2023-09-06T11:50:32.894Z',
      _formatted: {
        name: 'name',
        description: 'some description',
        content: '',
        id: '1bac7f97-9c06-437a-9db4-c46f97bc8605',
        type: 'folder',
        isPublishedRoot: false,
        createdAt: '2023-09-06T11:50:32.894Z',
        updatedAt: '2023-09-06T11:50:32.894Z',
      },
    },
  ],
  query: 'lettre',
  processingTimeMs: 13,
  limit: 20,
  offset: 0,
  estimatedTotalHits: 2,
};

const FACETS_RESPONSE = { facet: 1, facet1: 2 };

describe('Published Search Hook', () => {
  afterEach(() => {
    nock.cleanAll();
    vi.clearAllMocks();
    queryClient.clear();
  });

  describe('useSearchPublishedItems', () => {
    const route = `/${SEARCH_PUBLISHED_ITEMS_ROUTE}`;

    it(`Receive search results`, async () => {
      const query = 'some string';
      const tags = {
        [TagCategory.Discipline]: ['mycategory'],
        [TagCategory.Level]: [],
        [TagCategory.ResourceType]: [],
      };
      const hook = () =>
        hooks.useSearchPublishedItems({
          query,
          tags,
          page: 1,
          isPublishedRoot: true,
        });
      const key = itemKeys.search({
        query,
        tags,
        page: 1,
        isPublishedRoot: true,
      });
      const response = RESPONSE;
      const endpoints = [{ route, response, method: HttpMethod.Post }];
      const { data } = await mockHook({
        endpoints,
        hook,
        wrapper,
      });
      expect(data).toEqual(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqual(response);
    });

    it(`does not fetch if no query nor categories is provided`, async () => {
      const hook = () => hooks.useSearchPublishedItems({});
      const key = itemKeys.search({ page: 1 });
      const endpoints = [{ route, response: RESPONSE }];
      const { data, isFetched } = await mockHook({
        endpoints,
        hook,
        wrapper,
        enabled: false,
      });

      expect(isFetched).toBeFalsy();
      expect(data).toBeFalsy();
      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeFalsy();
    });

    it(`search for tags and published root = true`, async () => {
      const query = 'some string';
      const tags = {
        [TagCategory.Discipline]: ['mycategoryid'],
        [TagCategory.Level]: [],
        [TagCategory.ResourceType]: [],
      };
      const isPublishedRoot = true;

      const spy = vi.spyOn(axios, 'post');
      const key = itemKeys.search({
        isPublishedRoot,
        query,
        tags,
        page: 1,
      });
      const hook = () =>
        hooks.useSearchPublishedItems({
          query,
          tags,
          isPublishedRoot,
          page: 1,
        });
      const response = RESPONSE;
      const endpoints = [{ route, response, method: HttpMethod.Post }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(spy).toHaveBeenCalledWith(expect.stringContaining(route), {
        query,
        tags,
        isPublishedRoot: true,
        limit: 24,
        page: 1,
        elementsPerPage: DEFAULT_ELEMENTS_PER_PAGE,
      });

      expect(data).toEqual(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqual(response);
    });

    it(`search for page 3`, async () => {
      const query = 'some string';
      const isPublishedRoot = true;
      const page = 3;
      const spy = vi.spyOn(axios, 'post');
      const key = itemKeys.search({
        isPublishedRoot,
        query,
        page,
      });
      const hook = () =>
        hooks.useSearchPublishedItems({
          query,
          isPublishedRoot,
          page,
        });
      const response = RESPONSE;
      const endpoints = [{ route, response, method: HttpMethod.Post }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(spy).toHaveBeenCalledWith(expect.stringContaining(route), {
        query,
        limit: DEFAULT_ELEMENTS_PER_PAGE,
        page: 3,
        elementsPerPage: DEFAULT_ELEMENTS_PER_PAGE,
        isPublishedRoot: true,
      });

      expect(data).toEqual(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqual(response);
    });

    it(`search for langs`, async () => {
      const isPublishedRoot = true;
      const page = 3;
      const langs = ['en', 'fr'];
      const spy = vi.spyOn(axios, 'post');
      const key = itemKeys.search({
        isPublishedRoot,
        langs,
        page,
      });
      const hook = () =>
        hooks.useSearchPublishedItems({ langs, isPublishedRoot, page });
      const response = RESPONSE;
      const endpoints = [{ route, response, method: HttpMethod.Post }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(spy).toHaveBeenCalledWith(expect.stringContaining(route), {
        isPublishedRoot: true,
        langs,
        limit: 24,

        page,
        elementsPerPage: DEFAULT_ELEMENTS_PER_PAGE,
        query: undefined,
      });

      expect(data).toEqual(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqual(response);
    });

    it(`does not fetch for enabled = false`, async () => {
      const query = 'some string';
      const isPublishedRoot = true;
      const key = itemKeys.search({
        isPublishedRoot,
        query,
        page: 1,
      });
      const hook = () =>
        hooks.useSearchPublishedItems({
          query,
          isPublishedRoot,
          enabled: false,
        });
      const response = RESPONSE;
      const endpoints = [{ route, response, method: HttpMethod.Post }];
      const { data, isFetched } = await mockHook({
        endpoints,
        hook,
        wrapper,
        enabled: false,
      });

      expect(isFetched).toBeFalsy();
      expect(data).toBeFalsy();
      expect(queryClient.getQueryData(key)).toBeFalsy();
    });
  });

  describe('useSearchFacets', () => {
    const facetName = 'facetName';
    const route = `/${buildGetSearchFacets(facetName)}`;

    it(`Receive facets for facetName`, async () => {
      const hook = () =>
        hooks.useSearchFacets({
          facetName,
        });
      const key = buildFacetKey({
        facetName,
      });
      const response = FACETS_RESPONSE;
      const endpoints = [{ route, response, method: HttpMethod.Post }];
      const { data } = await mockHook({
        endpoints,
        hook,
        wrapper,
      });
      expect(data).toEqual(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqual(response);
    });

    it(`does not fetch if no facet name is provided`, async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const hook = () => hooks.useSearchFacets({});
      const endpoints = [{ route, response: RESPONSE }];
      const { data, isFetched } = await mockHook({
        endpoints,
        hook,
        wrapper,
        enabled: false,
      });

      expect(isFetched).toBeFalsy();
      expect(data).toBeFalsy();
    });

    it(`pass down tags and published root`, async () => {
      const query = 'some string';
      const tags = {
        [TagCategory.Discipline]: ['mycategoryid'],
        [TagCategory.Level]: [],
        [TagCategory.ResourceType]: [],
      };
      const isPublishedRoot = true;

      const spy = vi.spyOn(axios, 'post');
      const key = buildFacetKey({
        isPublishedRoot,
        query,
        tags,
        facetName,
      });
      const hook = () =>
        hooks.useSearchFacets({
          facetName,
          query,
          tags,
          isPublishedRoot,
        });
      const response = FACETS_RESPONSE;
      const endpoints = [{ route, response, method: HttpMethod.Post }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(spy).toHaveBeenCalledWith(expect.stringContaining(route), {
        query,
        tags,
        isPublishedRoot: true,
        facetName,
      });

      expect(data).toEqual(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqual(response);
    });
  });
});
