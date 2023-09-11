import { convertJs } from '@graasp/sdk';

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
          createdAt: '2023-09-06T11:50:32.894Z',
          updatedAt: '2023-09-06T11:50:32.894Z',
          _formatted: {
            name: '<em>lettre</em>',
            description: '',
            content: '',
            id: '4ad19906-a3e2-47ed-b5c9-e7764889a980',
            type: 'folder',
            categories: [],
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
          categories: [],
          isPublishedRoot: true,
          createdAt: '2023-09-06T13:17:12.568Z',
          updatedAt: '2023-09-06T13:17:12.568Z',
          _formatted: {
            name: 'name',
            description: 'my <em>lettre</em> is for oyu to sijefk',
            content: '',
            id: '0bac7f97-9c06-437a-9db4-c46f97bc8605',
            type: 'folder',
            categories: [],
            isPublishedRoot: true,
            createdAt: '2023-09-06T13:17:12.568Z',
            updatedAt: '2023-09-06T13:17:12.568Z',
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
          createdAt: '2023-09-06T13:17:12.568Z',
          updatedAt: '2023-09-06T13:17:12.568Z',
          _formatted: {
            name: 'name',
            description: 'some description',
            content: '',
            id: '1bac7f97-9c06-437a-9db4-c46f97bc8605',
            type: 'folder',
            categories: [],
            isPublishedRoot: false,
            createdAt: '2023-09-06T13:17:12.568Z',
            updatedAt: '2023-09-06T13:17:12.568Z',
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
    queryClient.clear();
  });

  describe('useSearchPublishedItems', () => {
    const route = `/${SEARCH_PUBLISHED_ITEMS_ROUTE}`;

    it(`Receive search results`, async () => {
      const query = 'some string';
      const categories = [['mycategoryid']];
      const hook = () => hooks.useSearchPublishedItems({ query, categories });
      const key = buildSearchPublishedItemsKey({ query, categories });
      const response = RESPONSE;
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data).toEqualImmutable(convertJs(response));

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqualImmutable(
        convertJs(response),
      );
    });

    it(`does not fetch if no query nor categories is provided`, async () => {
      const hook = () => hooks.useSearchPublishedItems({});
      const key = buildSearchPublishedItemsKey({});
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
      });
      const hook = () =>
        hooks.useSearchPublishedItems({
          query,
          categories,
          isPublishedRoot,
        });
      const response = RESPONSE;
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(spy).toHaveBeenCalledWith(expect.stringContaining(route), {
        queries: [
          {
            indexUid: 'itemIndex',
            attributesToHighlight: ['name', 'description', 'content'],
            q: query,
            filter: 'categories IN [mycategoryid] AND isPublishedRoot = true',
          },
        ],
      });

      expect(data).toEqualImmutable(convertJs(response));

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqualImmutable(
        convertJs(response),
      );
    });
  });
});
