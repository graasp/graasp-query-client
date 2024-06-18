import { ItemType } from '@graasp/sdk';

import { StatusCodes } from 'http-status-codes';
import nock from 'nock';
import { afterEach, describe, expect, it } from 'vitest';

import {
  UNAUTHORIZED_RESPONSE,
  generateFolders,
} from '../../../test/constants.js';
import { mockHook, setUpTest } from '../../../test/utils.js';
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
