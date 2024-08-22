import {
  DiscriminatedItem,
  FolderItemFactory,
  ItemTag,
  ItemTagType,
  MAX_TARGETS_FOR_READ_REQUEST,
  Member,
} from '@graasp/sdk';

import { StatusCodes } from 'http-status-codes';
import nock from 'nock';
import { afterEach, describe, expect, it } from 'vitest';

import {
  ITEM_TAGS,
  UNAUTHORIZED_RESPONSE,
  buildResultOfData,
  generateFolders,
} from '../../test/constants.js';
import {
  mockHook,
  setUpTest,
  splitEndpointByIds,
  splitEndpointByIdsForErrors,
} from '../../test/utils.js';
import { itemKeys } from '../keys.js';
import { buildGetItemTagsRoute, buildGetItemsTagsRoute } from '../routes.js';

const { hooks, wrapper, queryClient } = setUpTest();

describe('Item Tags Hooks', () => {
  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  describe('useItemTags', () => {
    const itemId = FolderItemFactory().id;
    const route = `/${buildGetItemTagsRoute(itemId)}`;
    const key = itemKeys.single(itemId).tags;

    const hook = () => hooks.useItemTags(itemId);

    it(`Receive tags of given item`, async () => {
      const response = ITEM_TAGS;
      const endpoints = [{ route, response }];
      const { data, isSuccess } = await mockHook({ endpoints, hook, wrapper });

      expect(data).toMatchObject(response);

      // verify cache keys
      expect(queryClient.getQueryData(key)).toMatchObject(response);
      expect(isSuccess).toBeTruthy();
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

  describe('useItemsTags', () => {
    const itemsIds = generateFolders(MAX_TARGETS_FOR_READ_REQUEST + 1).map(
      ({ id }) => id,
    );

    const keys = itemsIds.map((itemId) => itemKeys.single(itemId).tags);
    const tags = itemsIds.map((id) => [
      {
        id: 'some id',
        createdAt: '2023-09-06T11:50:32.894Z',
        creator: {} as Member,
        item: { id } as DiscriminatedItem,
        type: ItemTagType.Hidden,
      },
    ]);

    const hook = () => hooks.useItemsTags(itemsIds);

    it(`Receive tags of given items`, async () => {
      const response = buildResultOfData(tags, (t: ItemTag[]) => t[0].item.id);

      const endpoints = splitEndpointByIds(
        itemsIds,
        MAX_TARGETS_FOR_READ_REQUEST,
        (chunk) => `/${buildGetItemsTagsRoute(chunk)}`,
        tags,
        (t: ItemTag[]) => t[0].item.id,
      );
      const { data, isSuccess } = await mockHook({ endpoints, hook, wrapper });
      expect(data).toEqual(response);

      expect(isSuccess).toBeTruthy();
    });

    it(`Receive tags and save only for non-error tags`, async () => {
      const errors = [
        {
          name: 'error',
          message: 'error',
          stack: '',
        },
      ];
      const id = itemsIds[0];
      const tagsForItem = [
        {
          id: 'some id',
          createdAt: '2023-09-06T11:50:32.894Z',
          creator: {} as Member,
          item: { id } as DiscriminatedItem,
          type: ItemTagType.Hidden,
        },
      ];
      const response = buildResultOfData(
        [tagsForItem],
        (t: ItemTag[]) => t[0].item.id,
        errors,
      );
      const idWithError = 'some-id';
      const ids = [id, idWithError];
      const endpoints = splitEndpointByIdsForErrors(
        ids,
        MAX_TARGETS_FOR_READ_REQUEST,
        (chunk) => `/${buildGetItemsTagsRoute(chunk)}`,
        { response, statusCode: StatusCodes.OK },
      );

      const { data, isSuccess } = await mockHook({
        endpoints,
        hook: () => hooks.useItemsTags(ids),
        wrapper,
      });

      expect(data).toEqual(response);
      expect(isSuccess).toBeTruthy();
    });

    it(`Unauthorized`, async () => {
      const endpoints = [
        {
          route: `/${buildGetItemsTagsRoute(['some-id'])}`,
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
      keys.forEach((key) => expect(queryClient.getQueryData(key)).toBeFalsy());
    });
  });
});
