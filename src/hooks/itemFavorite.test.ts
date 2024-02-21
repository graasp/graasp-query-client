import { StatusCodes } from 'http-status-codes';
import { beforeEach, describe, expect, it } from 'vitest';

import { FAVORITE_ITEM, UNAUTHORIZED_RESPONSE } from '../../test/constants.js';
import { mockHook, setUpTest } from '../../test/utils.js';
import { GET_FAVORITE_ITEMS_ROUTE } from '../api/routes.js';
import { memberKeys } from '../config/keys.js';

const { hooks, wrapper, queryClient } = setUpTest();

describe('useFavoriteItems', () => {
  const route = `/${GET_FAVORITE_ITEMS_ROUTE}`;
  const key = memberKeys.current().favoriteItems;

  const hook = () => hooks.useFavoriteItems();

  beforeEach(() => {
    queryClient.clear();
  });

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
