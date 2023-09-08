import axios from 'axios';

import { QueryClientConfig } from '../types';
import { searchPublishedItems } from './search';

type SearchQuery = { queries: { q: string; filter: string }[] };

describe('Search API', () => {
  describe('searchPublishedItems', () => {
    let spy: jest.SpyInstance;
    beforeEach(() => {
      spy = jest.spyOn(axios, 'post').mockImplementation(async () => true);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('correctly send request', async () => {
      const query = 'query';
      const categories = [['id1']];

      await searchPublishedItems({ query, categories }, {
        API_HOST: 'apihost',
      } as QueryClientConfig);

      const call = (spy.mock.calls[0][1] as SearchQuery).queries[0];
      expect(call.q).toEqual(query);
      expect(call.filter).toEqual('categories IN [id1]');
    });
    it('correctly send request without query string', async () => {
      const categories = [['id1']];

      await searchPublishedItems({ categories }, {
        API_HOST: 'apihost',
      } as QueryClientConfig);

      const call = (spy.mock.calls[0][1] as SearchQuery).queries[0];
      expect(call.q).toBeUndefined();
      expect(call.filter).toEqual('categories IN [id1]');
    });
    it('correctly send request without categories', async () => {
      const query = 'query';

      await searchPublishedItems({ query }, {
        API_HOST: 'apihost',
      } as QueryClientConfig);

      const call = (spy.mock.calls[0][1] as SearchQuery).queries[0];
      expect(call.q).toEqual(query);
      expect(call.filter).toBeUndefined();
    });
    it('correctly send request for many categories', async () => {
      const query = 'query';
      const categories = [['id1', 'id2'], ['id3', 'id4'], ['id5']];

      await searchPublishedItems({ query, categories }, {
        API_HOST: 'apihost',
      } as QueryClientConfig);

      const call = (spy.mock.calls[0][1] as SearchQuery).queries[0];
      expect(call.q).toEqual(query);
      expect(call.filter).toEqual(
        'categories IN [id1,id2] AND categories IN [id3,id4] AND categories IN [id5]',
      );
    });
  });
});
