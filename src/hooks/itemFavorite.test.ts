import { StatusCodes } from 'http-status-codes';

import { FAVORITE_ITEM, UNAUTHORIZED_RESPONSE } from '../../test/constants';
import { mockHook, setUpTest } from '../../test/utils';
import { GET_FAVORITE_ITEMS_ROUTE } from '../api/routes';
import { memberKeys } from '../config/keys';

const { hooks, wrapper, queryClient } = setUpTest();

describe('useFavoriteItems', () => {
  const route = `/${GET_FAVORITE_ITEMS_ROUTE}`;
  const key = memberKeys.current().favoriteItems;

  const hook = () => hooks.useFavoriteItems();

  it(`Retrieve favorite items`, async () => {
    const response = FAVORITE_ITEM;
    const endpoints = [{ route, response }];
    await mockHook({ endpoints, hook, wrapper });

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
