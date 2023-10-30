import {
  DiscriminatedItem,
  ItemTag,
  ItemTagType,
  MAX_TARGETS_FOR_READ_REQUEST,
  Member,
} from '@graasp/sdk';
import { ItemTagRecord } from '@graasp/sdk/frontend';

import { StatusCodes } from 'http-status-codes';
import Immutable from 'immutable';
import Cookies from 'js-cookie';
import nock from 'nock';

import {
  ITEMS,
  ITEM_TAGS,
  UNAUTHORIZED_RESPONSE,
  buildResultOfData,
} from '../../test/constants';
import {
  mockHook,
  setUpTest,
  splitEndpointByIds,
  splitEndpointByIdsForErrors,
} from '../../test/utils';
import { buildGetItemTagsRoute, buildGetItemsTagsRoute } from '../api/routes';
import { itemTagsKeys } from '../config/keys';

const { hooks, wrapper, queryClient } = setUpTest();

jest.spyOn(Cookies, 'get').mockReturnValue({ session: 'somesession' });

describe('Item Tags Hooks', () => {
  afterEach(() => {
    nock.cleanAll();
    queryClient.clear();
  });

  describe('useItemTags', () => {
    const itemId = ITEMS.first()!.id;
    const route = `/${buildGetItemTagsRoute(itemId)}`;
    const key = itemTagsKeys.singleId(itemId);

    const hook = () => hooks.useItemTags(itemId);

    it(`Receive tags of given item`, async () => {
      const response = ITEM_TAGS;
      const endpoints = [{ route, response }];
      const { data, isSuccess } = await mockHook({ endpoints, hook, wrapper });

      expect(Immutable.is(data, response)).toBeTruthy();

      // verify cache keys
      expect(
        Immutable.is(queryClient.getQueryData(key), response),
      ).toBeTruthy();
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
    const itemsIds = ITEMS.map(({ id }) => id).toArray();

    const keys = itemsIds.map((itemId) => itemTagsKeys.singleId(itemId));
    const tags = itemsIds.map((id) => [
      {
        id: 'some id',
        createdAt: new Date(),
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
      expect(data?.toJS()).toEqual(response);

      // verify cache keys
      keys.forEach((key, idx) =>
        expect(queryClient.getQueryData<ItemTagRecord>(key)?.toJS()).toEqual(
          tags[idx],
        ),
      );

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
          createdAt: new Date(),
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

      expect(data?.toJS()).toEqual(response);

      // verify cache keys
      expect(
        queryClient
          .getQueryData<ItemTagRecord>(itemTagsKeys.singleId(ids[0]))
          ?.toJS(),
      ).toEqual(tagsForItem);
      expect(
        queryClient.getQueryData(itemTagsKeys.singleId(idWithError)),
      ).toBeFalsy();

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
