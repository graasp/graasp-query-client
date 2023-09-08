import { convertJs } from '@graasp/sdk';

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
    const query = 'some string';
    const categories = [['mycategoryid']];

    const route = `/${SEARCH_PUBLISHED_ITEMS_ROUTE}`;
    const key = buildSearchPublishedItemsKey(query, categories);

    it(`Receive search results`, async () => {
      const hook = () => hooks.useSearchPublishedItems({ query, categories });
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
  });
});
