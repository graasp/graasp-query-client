import { StatusCodes } from 'http-status-codes';
import Cookies from 'js-cookie';
import nock from 'nock';

import {
  ITEM_VALIDATION_GROUP,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants';
import { mockHook, setUpTest } from '../../test/utils';
import { buildGetLastItemValidationGroupRoute } from '../api/routes';
import { buildLastItemValidationGroupKey } from '../config/keys';

const { hooks, wrapper, queryClient } = setUpTest();

jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Item Validation Hooks', () => {
  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  describe('useLastItemValidationGroup', () => {
    const iVId = 'item-validation-id';
    const route = `/${buildGetLastItemValidationGroupRoute(iVId)}`;
    const key = buildLastItemValidationGroupKey(iVId);

    const hook = () => hooks.useLastItemValidationGroup(iVId);

    it(`Receive last item validation group of given item-validation-id`, async () => {
      const response = ITEM_VALIDATION_GROUP;
      const endpoints = [{ route, response }];
      const { data } = await mockHook({ endpoints, hook, wrapper });

      expect(data).toMatchObject(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toMatchObject(response);
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
