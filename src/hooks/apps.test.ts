import nock from 'nock';
import { buildAppListRoute } from '../api/routes';
import { mockHook, setUpTest } from '../../test/utils';
import {
    APPS,
} from '../../test/constants';
import { APPS_KEY } from '../config/keys';
import { List } from 'immutable';

const { hooks, wrapper, queryClient } = setUpTest();

describe('Apps Hooks', () => {
  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  describe('useApps', () => {
    const route = `/${buildAppListRoute}`;
    const key = APPS_KEY;

    const hook = () => hooks.useApps();

    it(`Recieve list of apps`, async () => {
      const response = APPS;
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect((data as List<unknown>).toJS()).toEqual(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqual(List(response));
    });
  });
});
