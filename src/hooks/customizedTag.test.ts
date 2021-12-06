import nock from 'nock';
import { StatusCodes } from 'http-status-codes';
import { buildGetCustomizedTagsRoute } from '../api/routes';
import { mockHook, setUpTest } from '../../test/utils';
import { CUSTOMIZED_TAGS, UNAUTHORIZED_RESPONSE } from '../../test/constants';
import { buildCustomizedTagsKey } from '../config/keys';
import { List } from 'immutable';

const { hooks, wrapper, queryClient } = setUpTest();

describe('Item Flag Hooks', () => {
  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  describe('useCustomizedTags', () => {
    const itemId = 'item-id'
    const route = `/${buildGetCustomizedTagsRoute(itemId)}`;
    const key = buildCustomizedTagsKey(itemId);

    const hook = () => hooks.useCustomizedTags(itemId);

    it(`Receive customized tags`, async () => {
      const response = CUSTOMIZED_TAGS;
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect((data as List<string>).toJS()).toEqual(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toEqual(response);
    });

    it(`Unauthorized`, async () => {
      const endpoints = [
        {
          route,
          response: UNAUTHORIZED_RESPONSE,
          statusCode: StatusCodes.UNAUTHORIZED,
        },
      ];
      const { data, isError } = await mockHook({
        hook,
        wrapper,
        endpoints,
      });

      expect(data).toBeFalsy();
      expect(isError).toBeTruthy();
      // verify cache keys
      expect(queryClient.getQueryData(key)).toBeFalsy();
    });
  });
});
