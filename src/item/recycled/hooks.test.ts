import { DiscriminatedItem, Paginated } from '@graasp/sdk';

import { waitFor } from '@testing-library/dom';
import { act, renderHook } from '@testing-library/react';
import { StatusCodes } from 'http-status-codes';
import nock from 'nock';
import { afterEach, describe, expect, it } from 'vitest';

import {
  UNAUTHORIZED_RESPONSE,
  generateFolders,
} from '../../../test/constants.js';
import { mockEndpoints, mockHook, setUpTest } from '../../../test/utils.js';
import { memberKeys } from '../../keys.js';
import { buildGetOwnRecycledItemRoute } from './routes.js';

const { hooks, wrapper, queryClient } = setUpTest();

describe('useInfiniteOwnRecycledItems', () => {
  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  const pagination = { page: 1 };
  const route = `/${buildGetOwnRecycledItemRoute(pagination)}`;
  const items = generateFolders();
  const response = { data: items, totalCount: items.length };
  const hook = () => hooks.useInfiniteOwnRecycledItems(pagination);
  const key = memberKeys.current().infiniteRecycledItemData();

  it(`Receive recycled items`, async () => {
    const endpoints = [{ route, response }];
    const { data } = await mockHook({ endpoints, hook, wrapper });
    expect(data!.pages[0]).toMatchObject(response);
    // verify cache keys
    expect(
      queryClient.getQueryData<{ pages: Paginated<DiscriminatedItem>[] }>(key)!
        .pages[0],
    ).toMatchObject(response);
  });

  it(`calling nextPage accumulate items`, async () => {
    const endpoints = [{ route, response }];
    // cannot use mockHook because it prevents getting updated data
    mockEndpoints(endpoints);

    // wait for rendering hook
    const { result } = renderHook(hook, { wrapper });

    await waitFor(() =>
      expect(result.current.isSuccess || result.current.isError).toBe(true),
    );

    act(() => {
      result.current.fetchNextPage();
    });
  });

  it(`Unauthorized`, async () => {
    const endpoints = [
      {
        route,
        response: UNAUTHORIZED_RESPONSE,
        statusCode: StatusCodes.UNAUTHORIZED,
      },
    ];
    const { isError } = await mockHook({
      hook,
      wrapper,
      endpoints,
    });

    expect(isError).toBeTruthy();
  });
});
