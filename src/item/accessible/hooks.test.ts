import { ItemType, PackedItem, Paginated } from '@graasp/sdk';

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
import { itemKeys } from '../../keys.js';
import { buildGetAccessibleItems } from '../routes.js';

const { hooks, wrapper, queryClient } = setUpTest();

describe('useAccessibleItems', () => {
  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  const params = {};
  const pagination = {};
  const route = `/${buildGetAccessibleItems(params, pagination)}`;
  const items = generateFolders();
  const response = { data: items, totalCount: items.length };
  const hook = () => hooks.useAccessibleItems();
  const key = itemKeys.accessiblePage(params, pagination);

  it(`Receive accessible items`, async () => {
    const endpoints = [{ route, response }];
    const { data } = await mockHook({ endpoints, hook, wrapper });

    expect(data).toMatchObject(response);
    // verify cache keys
    expect(queryClient.getQueryData(key)).toMatchObject(response);
  });

  it(`Route constructed correctly for accessible folders`, async () => {
    const typesParams = { types: [ItemType.FOLDER] };
    const url = `/${buildGetAccessibleItems(typesParams, {})}`;
    const urlObject = new URL(url, 'https://no-existing-url.tmp');
    const queryParams = urlObject.searchParams;
    const typesValue = queryParams.get('types');

    expect(typesValue).toEqual(ItemType.FOLDER);
  });

  it(`Receive accessible folders for search`, async () => {
    const keywords = 'search search1';
    const keyForSearch = itemKeys.accessiblePage({ keywords }, pagination);
    const endpoints = [
      {
        route: `/${buildGetAccessibleItems({ keywords }, { page: 1 })}`,
        response,
      },
    ];
    const { data } = await mockHook({
      endpoints,
      hook: () => hooks.useAccessibleItems({ keywords }),
      wrapper,
    });
    expect(data).toMatchObject(response);
    // verify cache keys
    expect(queryClient.getQueryData(keyForSearch)).toMatchObject(response);
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
      endpoints,
      wrapper,
    });

    expect(data).toBeFalsy();
    expect(isError).toBeTruthy();
    // verify cache keys
    expect(queryClient.getQueryData(key)).toBeFalsy();
  });
});

describe('useInfiniteAccessibleItems', () => {
  const params = {};
  const pagination = { page: 1 };
  const route = `/${buildGetAccessibleItems(params, pagination)}`;
  const items = generateFolders();
  const response = { data: items, totalCount: items.length };
  const hook = () => hooks.useInfiniteAccessibleItems(params);
  const key = itemKeys.infiniteAccessible(params);

  it(`Receive accessible items`, async () => {
    const endpoints = [{ route, response }];
    const { data } = await mockHook({ endpoints, hook, wrapper });
    expect(data!.pages[0]).toMatchObject(response);
    // verify cache keys
    expect(
      queryClient.getQueryData<{ pages: Paginated<PackedItem>[] }>(key)!
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
    const creatorId = 'old';
    const route1 = `/${buildGetAccessibleItems({ ...params, creatorId }, pagination)}`;
    const route2 = `/${buildGetAccessibleItems({ ...params, creatorId }, { page: 2 })}`;
    const newCreatorId = 'new';
    const route3 = `/${buildGetAccessibleItems({ ...params, creatorId: newCreatorId }, pagination)}`;
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
        const [c, setCreatorId] = useState(creatorId);
        const res = hooks.useInfiniteAccessibleItems({ creatorId: c });
        return { ...res, setCreatorId };
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
      result.current.setCreatorId(newCreatorId);
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

  it(`Route constructed correctly for accessible folders`, async () => {
    const typesParams = { types: [ItemType.FOLDER] };
    const url = `/${buildGetAccessibleItems(typesParams, {})}`;
    const urlObject = new URL(url, 'https://no-existing-url.tmp');
    const queryParams = urlObject.searchParams;
    const typesValue = queryParams.get('types');
    expect(typesValue).toEqual(ItemType.FOLDER);
  });
});
