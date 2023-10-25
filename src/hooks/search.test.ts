import { HttpMethod } from '@graasp/sdk';
import { MeiliSearchResultsRecord } from '@graasp/sdk/frontend';

import axios from 'axios';
import nock from 'nock';

import { mockHook, setUpTest } from '../../test/utils';
import { SEARCH_PUBLISHED_ITEMS_ROUTE } from '../api/routes';
import { buildSearchPublishedItemsKey } from '../config/keys';

const { hooks, wrapper, queryClient } = setUpTest();

const RESPONSE = {
  results: [
    {
      indexUid: 'itemIndex',
      hits: [
        {
          name: 'lettre',
          description: '',
          content: '',
          id: '4ad19906-a3e2-47ed-b5c9-e7764889a980',
          type: 'folder',
          categories: [],
          isPublishedRoot: true,
          createdAt: new Date('2023-09-06T11:50:32.894Z'),
          updatedAt: new Date('2023-09-06T11:50:32.894Z'),
          _formatted: {
            name: '<em>lettre</em>',
            description: '',
            content: '',
            id: '4ad19906-a3e2-47ed-b5c9-e7764889a980',
            type: 'folder',
            categories: [],
            isPublishedRoot: true,
            createdAt: new Date('2023-09-06T11:50:32.894Z'),
            updatedAt: new Date('2023-09-06T11:50:32.894Z'),
          },
        },
        {
          name: 'name',
          description: 'my lettre is for oyu to sijefk',
          content: '',
          id: '0bac7f97-9c06-437a-9db4-c46f97bc8605',
          type: 'folder',
          categories: [],
          isPublishedRoot: true,
          createdAt: new Date('2023-09-06T11:50:32.894Z'),
          updatedAt: new Date('2023-09-06T11:50:32.894Z'),
          _formatted: {
            name: 'name',
            description: 'my <em>lettre</em> is for oyu to sijefk',
            content: '',
            id: '0bac7f97-9c06-437a-9db4-c46f97bc8605',
            type: 'folder',
            categories: [],
            isPublishedRoot: true,
            createdAt: new Date('2023-09-06T11:50:32.894Z'),
            updatedAt: new Date('2023-09-06T11:50:32.894Z'),
          },
        },
        {
          name: 'child of name',
          description: 'some description',
          content: '',
          id: '1bac7f97-9c06-437a-9db4-c46f97bc8605',
          type: 'folder',
          categories: [],
          isPublishedRoot: false,
          createdAt: new Date('2023-09-06T11:50:32.894Z'),
          updatedAt: new Date('2023-09-06T11:50:32.894Z'),
          _formatted: {
            name: 'name',
            description: 'some description',
            content: '',
            id: '1bac7f97-9c06-437a-9db4-c46f97bc8605',
            type: 'folder',
            categories: [],
            isPublishedRoot: false,
            createdAt: new Date('2023-09-06T11:50:32.894Z'),
            updatedAt: new Date('2023-09-06T11:50:32.894Z'),
          },
        },
      ],
      query: 'lettre',
      processingTimeMs: 13,
      limit: 20,
      offset: 0,
      estimatedTotalHits: 2,
    },
  ],
};

describe('Published Search Hook', () => {
  afterEach(() => {
    nock.cleanAll();
    jest.clearAllMocks();
    queryClient.clear();
  });

  describe('useSearchPublishedItems', () => {
    const route = `/${SEARCH_PUBLISHED_ITEMS_ROUTE}`;

    it(`Receive search results`, async () => {
      const query = 'some string';
      const categories = [['mycategoryid']];
      const hook = () =>
        hooks.useSearchPublishedItems({ query, categories, page: 1 });
      const key = buildSearchPublishedItemsKey({
        query,
        categories,
        page: 1,
        isPublishedRoot: true,
      });
      const response = RESPONSE;
      const endpoints = [{ route, response, method: HttpMethod.POST }];
      const { data } = await mockHook({
        endpoints,
        hook,
        wrapper,
      });
      expect(data).toEqual(response);

      // verify cache keys
      expect(queryClient.getQueryData<MeiliSearchResultsRecord>(key)).toEqual(
        response,
      );
    });

    it(`does not fetch if no query nor categories is provided`, async () => {
      const hook = () => hooks.useSearchPublishedItems({});
      const key = buildSearchPublishedItemsKey({ page: 1 });
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

    it(`search for categories and published root = true`, async () => {
      const query = 'some string';
      const categories = [['mycategoryid']];
      const isPublishedRoot = true;
      const spy = jest.spyOn(axios, 'post');
      const key = buildSearchPublishedItemsKey({
        isPublishedRoot,
        query,
        categories,
        page: 1,
      });
      const hook = () =>
        hooks.useSearchPublishedItems({
          query,
          categories,
          isPublishedRoot,
          page: 1,
        });
      const response = RESPONSE;
      const endpoints = [{ route, response, method: HttpMethod.POST }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(spy).toHaveBeenCalledWith(expect.stringContaining(route), {
        queries: [
          {
            indexUid: 'itemIndex',
            attributesToHighlight: [
              'name',
              'description',
              'content',
              'creator',
            ],
            q: query,
            filter: 'categories IN [mycategoryid] AND isPublishedRoot = true',
            attributesToCrop: undefined,
            highlightPostTag: undefined,
            highlightPreTag: undefined,
            limit: 24,
            offset: 0,
            sort: undefined,
          },
        ],
      });

      expect(data).toEqual(response);

      // verify cache keys
      expect(queryClient.getQueryData<MeiliSearchResultsRecord>(key)).toEqual(
        response,
      );
    });

    it(`search for page 3`, async () => {
      const query = 'some string';
      const categories = [['mycategoryid']];
      const isPublishedRoot = true;
      const page = 3;
      const spy = jest.spyOn(axios, 'post');
      const key = buildSearchPublishedItemsKey({
        isPublishedRoot,
        query,
        categories,
        page,
      });
      const hook = () =>
        hooks.useSearchPublishedItems({
          query,
          categories,
          isPublishedRoot,
          page,
        });
      const response = RESPONSE;
      const endpoints = [{ route, response, method: HttpMethod.POST }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(spy).toHaveBeenCalledWith(expect.stringContaining(route), {
        queries: [
          {
            indexUid: 'itemIndex',
            attributesToHighlight: [
              'name',
              'description',
              'content',
              'creator',
            ],
            q: query,
            filter: 'categories IN [mycategoryid] AND isPublishedRoot = true',
            limit: 24,
            offset: 48, // (3 - 1) * 24
            attributesToCrop: undefined,
            highlightPostTag: undefined,
            highlightPreTag: undefined,
            sort: undefined,
          },
        ],
      });

      expect(data).toEqual(response);

      // verify cache keys
      expect(queryClient.getQueryData<MeiliSearchResultsRecord>(key)).toEqual(
        response,
      );
    });

    it(`does not fetch for enabled = false`, async () => {
      const query = 'some string';
      const categories = [['mycategoryid']];
      const isPublishedRoot = true;
      const key = buildSearchPublishedItemsKey({
        isPublishedRoot,
        query,
        categories,
        page: 1,
      });
      const hook = () =>
        hooks.useSearchPublishedItems({
          query,
          categories,
          isPublishedRoot,
          enabled: false,
        });
      const response = RESPONSE;
      const endpoints = [{ route, response, method: HttpMethod.POST }];
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
});
