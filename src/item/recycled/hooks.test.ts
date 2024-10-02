import {
  DiscriminatedItem,
  ItemType,
  Paginated,
  RecycledItemData,
} from '@graasp/sdk';

import { waitFor } from '@testing-library/dom';
import { act, renderHook } from '@testing-library/react';
import { StatusCodes } from 'http-status-codes';
import nock from 'nock';
import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import {
  UNAUTHORIZED_RESPONSE,
  generateFolders,
} from '../../../test/constants.js';
import { mockEndpoints, mockHook, setUpTest } from '../../../test/utils.js';
import { memberKeys } from '../../keys.js';
import { buildGetOwnRecycledItemDataRoute } from './routes.js';

const { hooks, wrapper, queryClient } = setUpTest();

describe('useInfiniteOwnRecycledItemData', () => {
  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  const params = {};
  const pagination = { page: 1 };
  const route = `/${buildGetOwnRecycledItemDataRoute(params, pagination)}`;
  const items = generateFolders();
  const response = { data: items, totalCount: items.length };
  const hook = () => hooks.useInfiniteOwnRecycledItemData(params);
  const key = memberKeys.current().infiniteRecycledItemData(params);

  it(`Receive recycled item data`, async () => {
    const endpoints = [{ route, response }];
    const { data } = await mockHook({ endpoints, hook, wrapper });
    expect(data!.pages[0]).toMatchObject(response);
    // verify cache keys
    expect(
      queryClient.getQueryData<{ pages: Paginated<RecycledItemData>[] }>(key)!
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

    // expect(result.current.data.length).toEqual(items.length * 2);
  });

  it(`Reset on change param`, async () => {
    const types: DiscriminatedItem['type'][] = [ItemType.FOLDER];
    const route1 = `/${buildGetOwnRecycledItemDataRoute({ ...params, types }, pagination)}`;
    const route2 = `/${buildGetOwnRecycledItemDataRoute({ ...params, types }, { page: 2 })}`;
    const newTypes: DiscriminatedItem['type'][] = [ItemType.APP];
    const route3 = `/${buildGetOwnRecycledItemDataRoute({ ...params, types: newTypes }, pagination)}`;
    const endpoints = [
      { route: route1, response },
      { route: route2, response },
      { route: route3, response },
    ];
    // cannot use mockHook because it prevents getting updated data
    mockEndpoints(endpoints);

    // // wait for rendering hook
    const { result } = renderHook(
      () => {
        const [t, setTypes] = useState(types);
        const res = hooks.useInfiniteOwnRecycledItemData({
          types: t,
        });
        return { ...res, setTypes };
      },
      { wrapper },
    );

    await waitFor(() =>
      expect(result.current.isSuccess || result.current.isError).toBe(true),
    );

    act(() => {
      result.current.fetchNextPage();
    });
    await waitFor(() => {
      expect(result.current.data!.pages.length).toEqual(2);
    });

    // changing creator id reset items
    act(() => {
      result.current.setTypes(newTypes);
    });

    await waitFor(() => expect(result.current.data!.pages.length).toEqual(1));
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

  it(`Route constructed correctly for recycled item data`, async () => {
    const typesParams = { types: [ItemType.FOLDER] };
    const url = `/${buildGetOwnRecycledItemDataRoute(typesParams, {})}`;
    const urlObject = new URL(url, 'https://no-existing-url.tmp');
    const queryParams = urlObject.searchParams;
    const typesValue = queryParams.get('types');
    expect(typesValue).toEqual(ItemType.FOLDER);
  });
});
