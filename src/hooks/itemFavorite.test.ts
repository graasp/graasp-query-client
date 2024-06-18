import { StatusCodes } from 'http-status-codes';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  BOOKMARKED_ITEM,
  UNAUTHORIZED_RESPONSE,
} from '../../test/constants.js';
import { mockHook, setUpTest } from '../../test/utils.js';
import { memberKeys } from '../keys.js';
import { GET_BOOKMARKED_ITEMS_ROUTE } from '../routes.js';

const { hooks, wrapper, queryClient } = setUpTest();

describe('useBookmarkedItems', () => {
  const route = `/${GET_BOOKMARKED_ITEMS_ROUTE}`;
  const key = memberKeys.current().bookmarkedItems;

  const hook = () => hooks.useBookmarkedItems();

  beforeEach(() => {
    queryClient.clear();
  });

  it(`Retrieve bookmarked items`, async () => {
    const response = BOOKMARKED_ITEM;
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
