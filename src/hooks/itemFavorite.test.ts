import { StatusCodes } from 'http-status-codes';
import Immutable from 'immutable';

import { FAVORITE_ITEM, UNAUTHORIZED_RESPONSE } from '../../test/constants';
import { mockHook, setUpTest } from '../../test/utils';
import { GET_FAVORITE_ITEMS_ROUTE } from '../api/routes';
import { FAVORITE_ITEMS_KEY } from '../config/keys';

const { hooks, wrapper, queryClient } = setUpTest();

describe('useFavoriteItems', () => {
  const route = `/${GET_FAVORITE_ITEMS_ROUTE}`;
  const key = FAVORITE_ITEMS_KEY;

  const hook = () => hooks.useFavoriteItems();

  it(`Retrieve favorite items`, async () => {
    const response = FAVORITE_ITEM;
    const endpoints = [{ route, response: response.toJS() }];
    await mockHook({ endpoints, hook, wrapper });

    // verify cache keys
    expect(Immutable.is(queryClient.getQueryData(key), response)).toBeTruthy();
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
