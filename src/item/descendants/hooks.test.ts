import { FolderItemFactory, ItemType } from '@graasp/sdk';

import { StatusCodes } from 'http-status-codes';
import nock from 'nock';
import { afterEach, describe, expect, it } from 'vitest';

import {
  UNAUTHORIZED_RESPONSE,
  generateFolders,
} from '../../../test/constants.js';
import { mockHook, setUpTest } from '../../../test/utils.js';
import { itemKeys } from '../../keys.js';
import { buildGetItemDescendants } from '../routes.js';

const { hooks, wrapper, queryClient } = setUpTest();

describe('useDescendants', () => {
  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  const item = FolderItemFactory();
  const response = { item, ...generateFolders(3) };

  it('Gets descendants with type filter', async () => {
    const types = [ItemType.FOLDER, ItemType.APP];
    const key = itemKeys.single(item.id).descendants({ types });
    const hook = () => hooks.useDescendants({ id: item.id, types });
    const route = `/${buildGetItemDescendants(item.id)}?${types.map((t) => `types=${t}`).join('&')}`;
    const endpoints = [
      {
        route,
        response,
      },
    ];
    const { data, isError } = await mockHook({ endpoints, hook, wrapper });

    expect(data).toBeTruthy();
    expect(isError).toBeFalsy();
    // verify cache keys
    expect(queryClient.getQueryData(key)).toBeTruthy();
  });

  it('Gets descendants with showHidden disabled', async () => {
    const key = itemKeys.single(item.id).descendants({ showHidden: false });
    const hook = () => hooks.useDescendants({ id: item.id, showHidden: false });
    const route = `/${buildGetItemDescendants(item.id)}?showHidden=false`;
    const endpoints = [
      {
        route,
        response,
      },
    ];
    const { data, isError } = await mockHook({ endpoints, hook, wrapper });

    expect(data).toBeTruthy();
    expect(isError).toBeFalsy();
    // verify cache keys
    expect(queryClient.getQueryData(key)).toBeTruthy();
  });

  it(`Unauthorized`, async () => {
    const key = itemKeys.single(item.id).descendants();
    const hook = () => hooks.useDescendants({ id: item.id });
    const route = `/${buildGetItemDescendants(item.id)}`;
    const endpoints = [
      {
        route,
        response: UNAUTHORIZED_RESPONSE,
        statusCode: StatusCodes.UNAUTHORIZED,
      },
    ];
    const { data, isError } = await mockHook({ endpoints, hook, wrapper });

    expect(data).toBeFalsy();
    expect(isError).toBeTruthy();
    // verify cache keys
    expect(queryClient.getQueryData(key)).toBeFalsy();
  });
});
